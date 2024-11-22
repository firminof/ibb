'use client'

import * as React from 'react'
import {useEffect, useState} from 'react'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {format} from 'date-fns'
import {CalendarIcon, CameraIcon, ListIcon, PlusCircleIcon, XCircleIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import InputMask from 'react-input-mask'
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {useRouter, useSearchParams} from "next/navigation";
import ReactDatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from "date-fns/locale/pt-BR";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {Backdrop, CircularProgress} from "@mui/material";
import {UserRoles} from "@/lib/models/user";
import {UserApi} from "@/lib/api/user-api";
import {IMinistries} from "@/lib/models/user-response-api";
import {RefinementCtx} from "zod";

// Registrar o local (se necessário)
registerLocale("pt-BR", ptBR);

// Interfaces and Enums
interface IMember {
    id: string
    nome: string
    isMember: boolean
    isDiacono: boolean
}

enum UserRolesV2 {
    ADMIN = 'ADMIN',
    MEMBRO = 'MEMBRO',
}

enum StatusEnumV2 {
    VISITANTE = 'visitante',
    CONGREGADO = 'congregado',
    ATIVO = 'ativo',
    INATIVO = 'inativo',
    TRANSFERIDO = 'transferido',
    FALECIDO = 'falecido',
    EXCLUIDO = 'excluido',
}

enum CivilStateEnumV2 {
    SOLTEIRO = 'solteiro',
    CASADO = 'casado',
    SEPARADO = 'separado',
    DIVORCIADO = 'divorciado',
    VIUVO = 'viuvo',
}

interface UserAddressV2 {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
}

const memberSchema = z.object({
    id: z.string().nullable(),
    nome: z.string().nullable(),
    isMember: z.boolean(),
    isDiacono: z.boolean(),
})

// Enum para MinisterioCategoriasEnum
const MinisterioCategoriasEnum = z.enum(['eclesiastico', 'pessoas', 'coordenacao']); // Substitua pelas categorias reais

// Schema para MinistrieEntity
const MinistrieEntitySchema = z.object({
    _id: z.string().optional(),
    nome: z.string(),
    categoria: MinisterioCategoriasEnum,
    responsavel: z.array(memberSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Uso do schema
type MinistriesEntity = z.infer<typeof MinistrieEntitySchema>;

const formSchema = z
    .object({
        _id: z.string(),
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        foto: z.string().optional(),
        cpf: z
            .string()
            .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
        rg: z
            .string()
            .regex(/^\d{3}\.\d{3}\.\d{3}$/, "RG inválido"),
        email: z.string().email("Email inválido"),
        telefone: z
            .string()
            .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
        dataNascimento: z.date({
            message: "Data de Nascimento inválida",
        }),
        role: z.nativeEnum(UserRolesV2, {
            errorMap: () => ({
                message: "O campo 'Nível de Acesso' é obrigatório.",
            }),
        }),
        status: z.nativeEnum(StatusEnumV2, {
            errorMap: () => ({
                message: "O campo Status é obrigatório.",
            }),
        }),
        isDiacono: z.boolean({
            errorMap: () => ({
                message: "O campo se o membro é um diácono/diaconisa é obrigatório.",
            }),
        }),
        informacoesPessoais: z.object({
            estadoCivil: z.nativeEnum(CivilStateEnumV2, {
                errorMap: () => ({
                    message: "O campo Estado Civil é obrigatório.",
                }),
            }),
            casamento: z.object({
                conjugue: memberSchema.nullable(), // Permite nulo, mas será validado em `superRefine`
                dataCasamento: z.date().nullable(),
            }),
            temFilhos: z.boolean(),
            filhos: z.array(memberSchema),
        }),
        diacono: memberSchema,
        ministerio: z.array(z.string()),
        endereco: z
            .object({
                rua: z.string(),
                numero: z.string(),
                complemento: z.string().optional(),
                bairro: z.string(),
                cidade: z.string(),
                estado: z.string(),
                cep: z.string(),
            })
            .nullable(),
        ingresso: z.object({
            data: z.date().nullable(),
            forma: z.string().nullable(),
            local: z.string().nullable(),
        }),
        transferencia: z.object({
            data: z.date().nullable(),
            motivo: z.string().nullable(),
            local: z.string().nullable(),
        }),
        falecimento: z.object({
            data: z.date().nullable(),
            motivo: z.string().nullable(),
            local: z.string().nullable(),
        }),
        exclusao: z.object({
            data: z.date().nullable(),
            motivo: z.string().nullable(),
        }),
        visitas: z.object({
            motivo: z.string().nullable(),
        }),
    })
    .superRefine((data, ctx) => {
        // Validação condicional para `status`
        const statusValidations = {
            ativo: () => {
                if (!data.ingresso.data || !data.ingresso.forma || !data.ingresso.local) {
                    ctx.addIssue({
                        path: ["ingresso"],
                        message: "Para membros ativos, os campos de ingresso são obrigatórios.",
                    });
                }
            },
            transferido: () => {
                if (
                    !data.transferencia.data ||
                    !data.transferencia.motivo ||
                    !data.transferencia.local
                ) {
                    ctx.addIssue({
                        path: ["transferencia"],
                        message:
                            "Para membros transferidos, os campos de transferência são obrigatórios.",
                    });
                }
            },
            falecido: () => {
                if (
                    !data.falecimento.data ||
                    !data.falecimento.motivo ||
                    !data.falecimento.local
                ) {
                    ctx.addIssue({
                        path: ["falecimento"],
                        message:
                            "Para membros falecidos, os campos de falecimento são obrigatórios.",
                    });
                }
            },
            excluido: () => {
                if (!data.exclusao.data || !data.exclusao.motivo) {
                    ctx.addIssue({
                        path: ["exclusao"],
                        message:
                            "Para membros excluídos, os campos de exclusão são obrigatórios.",
                    });
                }
            },
        };

        if (statusValidations[data.status]) {
            statusValidations[data.status]();
        }

        // Validação para estado civil `casado`
        if (data.informacoesPessoais.estadoCivil === CivilStateEnumV2.CASADO) {
            const casamento = data.informacoesPessoais.casamento;

            if (!casamento?.dataCasamento) {
                ctx.addIssue({
                    path: ["informacoesPessoais", "casamento", "dataCasamento"],
                    message: "A data de casamento é obrigatória.",
                });
            }

            if (!casamento?.conjugue) {
                ctx.addIssue({
                    path: ["informacoesPessoais", "casamento", "conjugue"],
                    message:
                        "As informações do cônjuge são obrigatórias para estado civil 'casado'.",
                });
            } else {
                const { conjugue } = casamento;

                if (!conjugue?.nome) {
                    ctx.addIssue({
                        path: ["informacoesPessoais", "casamento", "conjugue", "nome"],
                        message: "O nome do cônjuge é obrigatório.",
                    });
                }

                if (typeof conjugue?.isMember !== "boolean") {
                    ctx.addIssue({
                        path: ["informacoesPessoais", "casamento", "conjugue", "isMember"],
                        message: "Deve ser especificado se o cônjuge é membro.",
                    });
                }
            }
        }
    });



export type FormValuesMember = z.infer<typeof formSchema>;
export type FormValuesUniqueMember = z.infer<typeof memberSchema>;

export default function MemberForm() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state)
    const router = useRouter();
    const [initialData, setInitialData] = useState<FormValuesMember | null>(null)
    const [photo, setPhoto] = useState<string | null>(null)

    const searchParams = useSearchParams()

    const idMembro: string | null = searchParams.get('email')

    const isEditing: boolean = idMembro && idMembro.length > 0;

    const [ministerios, setMinisterios] = useState<MinistriesEntity[]>([]);
    const [diaconos, setDiaconos] = useState<FormValuesUniqueMember[]>([]);
    const [membros, setMembros] = useState<FormValuesMember[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "informacoesPessoais.filhos"
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            // In a real application, you would fetch this data from an API
            const data: z.infer<typeof formSchema> = {
                "_id": "",
                "isDiacono": false,
                "nome": "",
                "rg": "",
                "role": UserRolesV2.MEMBRO,
                "telefone": "",
                "cpf": "",
                "email": "",
                "dataNascimento": "",
                "idade": 0,
                "foto": "",
                "diacono": {
                    "nome": "",
                    "isDiacono": false,
                    "isMember": false,
                    "id": '-1'
                },
                "endereco": {
                    "cep": "",
                    "rua": "",
                    "numero": "",
                    "complemento": "",
                    "bairro": "",
                    "cidade": "",
                    "estado": "",
                    "pais": ""
                },
                "status": "visitante",
                "exclusao": {
                    "data": null,
                    "motivo": null,
                },
                "falecimento": {
                    "data": null,
                    "local": null,
                    "motivo": null,
                },
                "informacoesPessoais": {
                    "casamento": {
                        "conjugue": {
                            "nome": "",
                            "isDiacono": false,
                            "isMember": true,
                            "id": '-1'
                        },
                        "dataCasamento": null,
                    },
                    "estadoCivil": "solteiro",
                    "temFilhos": false,
                    "filhos": []
                },
                "ingresso": {
                    "data": null,
                    "forma": null,
                    "local": null,
                },
                "ministerio": [],
                "transferencia": {
                    "data": null,
                    "local": null,
                    "motivo": null,
                },
                "visitas": {
                    "motivo": null,
                }
            }
            setInitialData(data)
            setPhoto(data.foto || null)
            form.reset(data)
        }

        fetchInitialData()
    }, [form])

    const onSubmit = async (data: FormValuesMember) => {
        const result = formSchema.safeParse(data);

        if (!result.success) {
            // `result.error` contém os detalhes dos erros
            const errors = result.error.format();
            console.log("Erros encontrados:", errors);
            return errors;
        }


        // Here you would typically send the data to your backend
        console.log('Form submitted with data:', {...data, foto: photo})

        try {
            UserApi.createMember({...data, foto: photo})
        } catch (e) {

        }

        // Simulating an API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        alert('Membro salvo com sucesso!')
    }

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhoto(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    useEffect(() => {
        if (useStoreIbbZus.hasHydrated && useStoreIbbZus.role === UserRoles.MEMBRO && (!idMembro || idMembro.length === 0)) {
            router.push('/user')
            return
        }
        if (useStoreIbbZus.hasHydrated && useStoreIbbZus.user == null) {
            useStoreIbbZus.addUser(null)
            useStoreIbbZus.addRole('')
            useStoreIbbZus.addMongoId('')
            useStoreIbbZus.setHasHydrated(true)
            router.push('/login')
            return
        }

        getAllMinistries();
        getAllMembers();
        getAllMembersDiaconos();
    }, [useStoreIbbZus.hasHydrated])

    const getAllMinistries = () => {
        try {
            UserApi.fetchMinistries()
                .then((response: IMinistries[]) => {
                    if (response && response.length > 0) {
                        setMinisterios(response);
                        return;
                    }

                    setMinisterios([]);
                })
                .catch((error) => {
                    console.log(error);
                    setMinisterios([]);

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            break;
                        case 'ERR_NETWORK':
                            break;

                        default:
                            break;
                    }
                })
                .finally(() => {

                });
        } catch (e) {
            setMinisterios([]);
        }
    }

    const getAllMembers = async (): Promise<void> => {
        try {
            UserApi.fetchMembers()
                .then((response: FormValuesMember[]) => {
                    if (response.length > 0) {
                        // // Mapeando ministérios para todos os membros
                        // const mappedMembers: FormValuesMember[] = response.map((member: FormValuesMember) => {
                        //     return {
                        //         ...member,
                        //         ministerio: member.ministerio.map((ministerioId: string) => {
                        //             return ministerios.find((ministerio: IMinistries) => ministerio._id === ministerioId.toString()) || null;
                        //         })
                        //     };
                        // });
                        setMembros(response);
                        return;
                    }

                    setMembros([]);
                })
                .catch((error) => {
                    console.log(error);
                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setMembros([]);
                            break;
                        case 'ERR_NETWORK':
                            setMembros([]);
                            break;

                        default:
                            setMembros([]);
                            break;
                    }
                })
        } catch (e) {
            setMembros([]);
        }
    }

    const getAllMembersDiaconos = async (): Promise<void> => {
        try {
            UserApi.fetchMembersDiaconos()
                .then((response: FormValuesMember[]) => {
                    if (response.length > 0) {
                        const mapDiaconos: FormValuesUniqueMember[] = response.map((diacono: FormValuesMember) => (
                            {
                                "nome": diacono.nome,
                                "isDiacono": diacono.isDiacono,
                                "isMember": true,
                                "id": diacono._id.toString()
                            }
                        ))
                        setDiaconos(mapDiaconos);
                        return;
                    }

                    setDiaconos([]);
                })
                .catch((error) => {
                    console.log(error);
                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setDiaconos([]);
                            break;
                        case 'ERR_NETWORK':
                            setDiaconos([]);
                            break;

                        default:
                            setDiaconos([]);
                            break;
                    }
                })
        } catch (e) {
            setDiaconos([]);
        }
    }

    if (!initialData) {
        return <Backdrop
            sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={true}
        >
            <div className="flex flex-col items-center">
                <CircularProgress color="inherit"/>
                Carregando
            </div>
        </Backdrop>
    }

    const exibirCardCasamento: boolean = form.watch('informacoesPessoais.estadoCivil') === CivilStateEnumV2.CASADO;

    return (
        <div className="mt-4 mb-4 container mx-auto">
            <section>
                <Button variant="outline" className="text-black" onClick={() => console.log('voltar')}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>

                <div className="flex justify-between items-center">
                    <h2 className="text-black text-3xl font-semibold mb-4 mt-4">{isEditing ? 'Editar Membro' : 'Cadastrar Membro'}</h2>
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                            onClick={() => router.push('/members')}>
                        <ListIcon className="w-4 h-4 mr-1"/>
                        Lista de Membros
                    </Button>
                </div>
            </section>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identificação Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* FOTO */}
                            <div className="flex flex-col items-center space-y-4">
                                {/* FOTO */}
                                <div className="space-y-2 text-center">
                                    <Label htmlFor="foto">Foto</Label>
                                    <div className="flex flex-col items-center space-y-4">
                                        {photo && (
                                            <img
                                                src={photo}
                                                alt="Foto do membro"
                                                className="w-32 h-32 rounded-full object-cover border-2 border-zinc-800 border-solid p-1"
                                            />
                                        )}
                                        <Label htmlFor="photo-upload"
                                               className="cursor-pointer flex flex-col items-center">
                                            <CameraIcon className="w-12 h-12"/>
                                            <span className="sr-only">Upload foto</span>
                                        </Label>
                                        <Input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/*NOME*/}
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Nome</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/*CPF e RG*/}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="cpf"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>CPF</FormLabel>
                                            <FormControl>
                                                <InputMask
                                                    mask="999.999.999-99"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    {(inputProps: any) => <Input
                                                        placeholder={"999.999.999-99"} {...inputProps} />}
                                                </InputMask>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {/*RG*/}
                                <FormField
                                    control={form.control}
                                    name="rg"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>RG</FormLabel>
                                            <FormControl>
                                                <InputMask
                                                    mask="999.999.999"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    {(inputProps: any) => <Input
                                                        placeholder={"999.999.999"} {...inputProps} />}
                                                </InputMask>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/*EMAIL e TELEFONE*/}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} placeholder={"jhon@email.com"}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="telefone"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormControl>
                                                <InputMask
                                                    mask="(99) 99999-9999"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    {(inputProps: any) => <Input
                                                        placeholder={"(99) 99999-9999"} {...inputProps} />}
                                                </InputMask>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/*DATA NASCIMENTO*/}
                            <FormField
                                control={form.control}
                                name="dataNascimento"
                                render={({field}) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data de Nascimento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[280px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                        ) : (
                                                            <span>Selecione uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <ReactDatePicker
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    showPopperArrow={false} // Remove seta visual (opcional)
                                                    dateFormat="dd/MM/yyyy"
                                                    maxDate={new Date()}
                                                    minDate={new Date("1900-01-01")}
                                                    showMonthDropdown // Exibir dropdown de mês
                                                    showYearDropdown // Exibir dropdown de ano
                                                    dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                    locale="pt-BR" // Local para PT-BR
                                                    className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/*NIVEL DE ACESSO E STATUS MEMBRESIA*/}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nível de Acesso e Status de Membresia</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/*ROLE*/}
                            <FormField
                                control={form.control}
                                name="role"
                                render={({field}) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Nível de Acesso</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={UserRolesV2.ADMIN}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Admin
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={UserRolesV2.MEMBRO}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Membro
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/*STATUS*/}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Status de Membresia</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(StatusEnumV2).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/*STATUS ATIVO*/}
                            {form.watch('status') === StatusEnumV2.ATIVO && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dados de Ingresso</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="ingresso.data"
                                            render={({field}) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Data de Ingresso</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-[280px] pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                    ) : (
                                                                        <span>Selecione uma data</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50"/>
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <ReactDatePicker
                                                                selected={field.value}
                                                                onChange={field.onChange}
                                                                showPopperArrow={false} // Remove seta visual (opcional)
                                                                dateFormat="dd/MM/yyyy"
                                                                maxDate={new Date()}
                                                                minDate={new Date("1900-01-01")}
                                                                showMonthDropdown // Exibir dropdown de mês
                                                                showYearDropdown // Exibir dropdown de ano
                                                                dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                locale="pt-BR" // Local para PT-BR
                                                                className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ingresso.forma"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Forma de Ingresso</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ingresso.local"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Local de Ingresso</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/*STATUS TRANSFERIDO*/}
                            {form.watch('status') === StatusEnumV2.TRANSFERIDO && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transferência</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="transferencia.data"
                                            render={({field}) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Data de Transferência</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-[280px] pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                    ) : (
                                                                        <span>Selecione uma data</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50"/>
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <ReactDatePicker
                                                                selected={field.value}
                                                                onChange={field.onChange}
                                                                showPopperArrow={false} // Remove seta visual (opcional)
                                                                dateFormat="dd/MM/yyyy"
                                                                maxDate={new Date()}
                                                                minDate={new Date("1900-01-01")}
                                                                showMonthDropdown // Exibir dropdown de mês
                                                                showYearDropdown // Exibir dropdown de ano
                                                                dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                locale="pt-BR" // Local para PT-BR
                                                                className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="transferencia.motivo"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Motivo da Transferência</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="transferencia.local"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Local de Transferência</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/*STATUS FALECIDO*/}
                            {form.watch('status') === StatusEnumV2.FALECIDO && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Falecimento</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="falecimento.data"
                                            render={({field}) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Data de Falecimento</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-[280px] pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                    ) : (
                                                                        <span>Selecione uma data</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50"/>
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <ReactDatePicker
                                                                selected={field.value}
                                                                onChange={field.onChange}
                                                                showPopperArrow={false} // Remove seta visual (opcional)
                                                                dateFormat="dd/MM/yyyy"
                                                                maxDate={new Date()}
                                                                minDate={new Date("1900-01-01")}
                                                                showMonthDropdown // Exibir dropdown de mês
                                                                showYearDropdown // Exibir dropdown de ano
                                                                dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                locale="pt-BR" // Local para PT-BR
                                                                className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="falecimento.motivo"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Motivo do Falecimento</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="falecimento.local"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Local do Falecimento</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/*STATUS EXCLUIDO*/}
                            {form.watch('status') === StatusEnumV2.EXCLUIDO && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Exclusão</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="exclusao.data"
                                            render={({field}) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Data de Exclusão</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-[280px] pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                    ) : (
                                                                        <span>Selecione uma data</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50"/>
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <ReactDatePicker
                                                                selected={field.value}
                                                                onChange={field.onChange}
                                                                showPopperArrow={false} // Remove seta visual (opcional)
                                                                dateFormat="dd/MM/yyyy"
                                                                maxDate={new Date()}
                                                                minDate={new Date("1900-01-01")}
                                                                showMonthDropdown // Exibir dropdown de mês
                                                                showYearDropdown // Exibir dropdown de ano
                                                                dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                locale="pt-BR" // Local para PT-BR
                                                                className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="exclusao.motivo"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Motivo da Exclusão</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/*STATUS VISITANTE*/}
                            {form.watch('status') === StatusEnumV2.VISITANTE && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Visitas</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="visitas.motivo"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Motivo da Visita</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>

                    {/*ESTADO CIVIL*/}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/*ESTADO CIVIL*/}
                            <FormField
                                control={form.control}
                                name="informacoesPessoais.estadoCivil"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Estado Civil</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o estado civil"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(CivilStateEnumV2).map((estado) => (
                                                    <SelectItem key={estado} value={estado}>
                                                        {estado}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/*ESTADO CIVIL - CASADO*/}
                            {
                                exibirCardCasamento ? (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Indique seu cônjugue</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Perguntar se o cônjuge é membro */}
                                            <FormField
                                                control={form.control}
                                                name="informacoesPessoais.casamento.conjugue.isMember"
                                                render={({field}) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel>O cônjugue é membro(a)?</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                className="flex flex-col space-y-1"
                                                            >
                                                                <FormItem
                                                                    className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={true}/>
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        Sim
                                                                    </FormLabel>
                                                                </FormItem>
                                                                <FormItem
                                                                    className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={false}/>
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        Não
                                                                    </FormLabel>
                                                                </FormItem>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Condição para exibir campo de seleção de membro ou campo de texto */}
                                            {form.watch("informacoesPessoais.casamento.conjugue.isMember") ? (
                                                <FormField
                                                    control={form.control}
                                                    name="informacoesPessoais.casamento.conjugue.id"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Selecione o(a) cônjugue</FormLabel>
                                                            <Select onValueChange={field.onChange}
                                                                    defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue
                                                                            placeholder="Selecione o(a) cônjugue"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {membros.map((member: FormValuesMember) => (
                                                                        <SelectItem key={member._id + '_casamento'}
                                                                                    value={member._id.toString()}>
                                                                            {member.nome}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            ) : (
                                                <FormField
                                                    control={form.control}
                                                    name="informacoesPessoais.casamento.conjugue.nome"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Cônjuge</FormLabel>
                                                            <FormControl>
                                                                <Input {...field}
                                                                       defaultValue={''}
                                                                       value={''}
                                                                       placeholder="Digite o nome do(a) cônjuge"/>
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Data de casamento */}
                                            <FormField
                                                control={form.control}
                                                name="informacoesPessoais.casamento.dataCasamento"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Data do Casamento</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-[280px] pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                        ) : (
                                                                            <span>Selecione uma data</span>
                                                                        )}
                                                                        <CalendarIcon
                                                                            className="ml-auto h-4 w-4 opacity-50"/>
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <ReactDatePicker
                                                                    selected={field.value}
                                                                    onChange={field.onChange}
                                                                    showPopperArrow={false} // Remove seta visual (opcional)
                                                                    dateFormat="dd/MM/yyyy"
                                                                    maxDate={new Date()}
                                                                    minDate={new Date("1900-01-01")}
                                                                    showMonthDropdown // Exibir dropdown de mês
                                                                    showYearDropdown // Exibir dropdown de ano
                                                                    dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                    locale="pt-BR" // Local para PT-BR
                                                                    className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                ) : (<></>)
                            }

                            {/*FILHOS*/}
                            <FormField
                                control={form.control}
                                name="informacoesPessoais.temFilhos"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Tem filhos?
                                            </FormLabel>
                                            <FormDescription>
                                                Marque esta opção se deseja incluir informações sobre filhos.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {form.watch("informacoesPessoais.temFilhos") && (
                                <div className="space-y-4">
                                    {fields.map((field, index: number) => (
                                        <Card key={field.id}>
                                            <CardHeader
                                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Filho {index + 1}
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                >
                                                    <XCircleIcon className="h-4 w-4"/>
                                                </Button>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`informacoesPessoais.filhos.${index}.isMember`}
                                                        render={({field}) => (
                                                            <FormItem
                                                                className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel>
                                                                        É membro?
                                                                    </FormLabel>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {form.watch(`informacoesPessoais.filhos.${index}.isMember`) ? (
                                                        <FormField
                                                            control={form.control}
                                                            name={`informacoesPessoais.filhos.${index}.memberId`}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Selecione o Filho</FormLabel>
                                                                    <Select onValueChange={field.onChange}
                                                                            defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue
                                                                                    placeholder="Selecione um membro"/>
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {membros.map((member: FormValuesMember) => (
                                                                                <SelectItem key={member._id}
                                                                                            value={member._id}>
                                                                                    {member.nome}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ) : (
                                                        <FormField
                                                            control={form.control}
                                                            name={`informacoesPessoais.filhos.${index}.nome`}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Nome</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => append({
                                            id: '',
                                            nome: '',
                                            isMember: false,
                                            isDiacono: false,
                                        })}
                                    >
                                        <PlusCircleIcon className="mr-2 h-4 w-4"/>
                                        Adicionar Filho
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/*DIACONO*/}
                    <Card>
                        <CardHeader>
                            <CardTitle>Diácono/Diaconisa e Ministério</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/*DIACONO*/}
                            <FormField
                                control={form.control}
                                name="informacoesPessoais.isDiacono"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Membro é um diácono ou diaconisa?
                                            </FormLabel>
                                            <FormDescription>
                                                Marque esta opção caso seja.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`diacono.id`}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Selecione o Diácono/Diaconisa</FormLabel>
                                        <Select onValueChange={field.onChange}
                                                defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder="Selecione um Diácono/Diaconisa"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {diaconos.map((member: FormValuesUniqueMember) => (
                                                    <SelectItem key={member.id + "_diacono"}
                                                                value={member.id.toString()}>
                                                        {member.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/*MINISTÉRIO*/}
                            <FormField
                                control={form.control}
                                name="ministerio"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">Ministérios</FormLabel>
                                            <FormDescription>
                                                Selecione os ministérios em que o membro está envolvido.
                                            </FormDescription>
                                        </div>
                                        {ministerios.map((item: MinistriesEntity) => (
                                            <FormField
                                                key={item}
                                                control={form.control}
                                                name="ministerio"
                                                render={({field}) => {
                                                    return (
                                                        <FormItem
                                                            key={item}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item._id)}
                                                                    onCheckedChange={(checked: any) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item._id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== item._id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {item.nome}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Endereço (Opcional)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="endereco.rua"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Rua</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endereco.numero"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Número</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="endereco.complemento"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Complemento</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="endereco.bairro"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Bairro</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endereco.cidade"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Cidade</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="endereco.estado"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endereco.cep"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>CEP</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-1 justify-end mt-4 mb-4">
                        <Button type="submit" className="ml-auto" onClick={() => {
                            const result = formSchema.safeParse(form.getValues());
                            console.log(form.getValues());
                            console.log(result);
                        }}>
                            {isEditing ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}