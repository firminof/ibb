'use client'

import * as React from 'react'
import {useEffect, useState} from 'react'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {SafeParseError, SafeParseSuccess, ZodIssue} from 'zod'
import {format} from 'date-fns'
import {CalendarIcon, CameraIcon, PlusCircleIcon, XCircleIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import InputMask from 'react-input-mask'
import {useRouter, useSearchParams} from "next/navigation";
import ReactDatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from "date-fns/locale/pt-BR";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {Backdrop, CircularProgress} from "@mui/material";
import {CivilStateEnumV2, dataForm, formatUserV2, formSchema, FormValuesMember} from "@/lib/models/user";
import {UserApi} from "@/lib/api/user-api";
import {PasswordSection} from "@/app/invite/_components/password-section";
import {IInviteEntity} from "@/lib/models/invite";
import InvitationStatus from "@/app/invite/_components/invite-status";
import {compressBase64Image} from "@/lib/helpers/helpers";

// Registrar o local (se necessário)
registerLocale("pt-BR", ptBR);

export default function InviteV2Form() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state)
    const router = useRouter();

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [error, setError] = useState('')

    const [photo, setPhoto] = useState<string | null>(null)

    const searchParams = useSearchParams()
    const inviteId: string | null = searchParams.get('id')

    const [membros, setMembros] = useState<FormValuesMember[]>([]);

    const [openLoading, setLoading] = useState<boolean>(false);
    const [openLoadingMessage, setLoadingMessage] = useState<string>('');

    const [inviteStatus, setInviteStatus] = useState<boolean>(false);
    const [inviteExists, setInviteExists] = useState<boolean>(false);
    const [inviteInfo, setInviteInfo] = useState<IInviteEntity | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "informacoesPessoais.filhos"
    });

    const onSubmit = async (data: FormValuesMember) => {
        setLoading(true)
        setLoadingMessage('Salvando membro')
        const result = formSchema.safeParse(data)

        if (!result.success) {
            console.log("Erros encontrados:", result.error.format())
            setLoading(false)
            setLoadingMessage('')
            return
        }

        try {
            const {_id, ...dataToCreate} = {...data, foto: photo}
            console.log('dataToCreate: ', dataToCreate)

            if (!password || password === '') {
                setLoading(false)
                setLoadingMessage('')
                alert('Erro: Preencha a senha!')
                return
            }

            if (!confirmPassword || confirmPassword === '') {
                setLoading(false)
                setLoadingMessage('')
                alert('Erro: Preencha a confirmação da senha!')
                return
            }

            if (password !== confirmPassword) {
                setLoading(false)
                setLoadingMessage('')
                alert('Erro: As senhas não coincidem!')
                return
            }

            if (inviteId && inviteId.length > 0 && password === confirmPassword) {
                if (dataToCreate.informacoesPessoais.temFilhos && dataToCreate.informacoesPessoais.filhos.length === 0) {
                    alert('Adicione pelo menos 1 filho se a opção "Tem Filho" está como SIM.');
                    setLoading(false);
                    setLoadingMessage('');
                    return
                }

                await UserApi.createMemberByInvite(dataToCreate, inviteId, password)
                alert('Membro cadastrado com sucesso!')
                setLoading(false)
                setLoadingMessage('')
                router.push('/login')
                return
            }
        } catch (e) {
            console.error(e)
            alert(`Erro: ${e.response?.data?.message || 'Ocorreu um erro ao cadastrar o membro.'}`)
        }

        setLoading(false)
        setLoadingMessage('')
    }

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        // Limpar mensagens de erro
        setError(null);

        if (!file) return;

        // Verificar tamanho máximo do arquivo (500 KB)
        const maxSize = 0.5 * 1024 * 1024; // 600 KB em bytes
        if (file.size > maxSize) {
            setError("A imagem deve ter tamanho máximo de 500 KB");
            alert("A imagem deve ter tamanho máximo de 500 KB")
            return;
        }

        // Ler a imagem como Base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = e.target?.result as string;

            try {
                // Compactar a imagem para largura máxima de 800px e qualidade de 60%
                const compressed = await compressBase64Image(base64Image, 800, 0.6);
                setPhoto(compressed);
            } catch (error) {
                alert('Atenção: somente arquivo de imagem é permitido!')
                console.error('Erro ao compactar a imagem:', error);
            }
        };

        reader.readAsDataURL(file);
    }

    useEffect(() => {
        if (!inviteId || inviteId.length === 0) {
            useStoreIbbZus.addUser(null)
            useStoreIbbZus.addRole('')
            useStoreIbbZus.addMongoId('')
            useStoreIbbZus.setHasHydrated(true)
            router.push('/login')

            setLoading(false);
            setLoadingMessage('')
            return
        }

        const fetchInviteInfo = () => {
            setLoading(true);
            setLoadingMessage('Carregando informações do convite...')
            try {
                UserApi.fetchInviteInfo(inviteId)
                    .then((response: IInviteEntity) => {
                        if (response.isAccepted) {
                            setInviteExists(true);
                            setInviteInfo(response);
                            setInviteStatus(true);
                            return;
                        }

                        getAllMembers();

                        const member: FormValuesMember = formatUserV2(dataForm);
                        setPhoto(member.foto || null)
                        setInviteStatus(false);
                        form.reset(member)
                    })
                    .catch((error) => {
                        console.log(error);
                        switch (error.code) {
                            case 'ERR_BAD_REQUEST':
                                console.log(error.response.data.message)
                                if (error.response.data.message && error.response.data.message.includes("Nenhum convite encontrado na base de dados!")) {
                                    setInviteExists(false);
                                }
                                setInviteInfo(null);
                                setInviteStatus(true);
                                break;
                            case 'ERR_NETWORK':
                                setInviteExists(true);
                                setInviteInfo(null);
                                setInviteStatus(true);
                                break;

                            default:
                                setInviteExists(true);
                                setInviteInfo(null);
                                setInviteStatus(true);
                                break;
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                        setLoadingMessage('')
                    })
            } catch (e) {
                setInviteExists(false);
                setInviteInfo(null);
                setInviteStatus(true);
                setLoading(false);
                setLoadingMessage('')
            }
        }

        fetchInviteInfo();
    }, [useStoreIbbZus.hasHydrated])

    const getAllMembers = async (): Promise<void> => {
        setLoading(true);
        setLoadingMessage('Carregando informações relevantes...')
        try {
            UserApi.fetchMembers()
                .then((response: FormValuesMember[]) => {
                    if (response.length > 0) {
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
                .finally(() => {
                    setLoading(false);
                    setLoadingMessage('')
                })
        } catch (e) {
            setMembros([]);
            setLoading(false);
            setLoadingMessage('')
        }
    }

    if (openLoading) {
        return <Backdrop
            sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={true}
        >
            <div className="flex flex-col items-center">
                <CircularProgress color="inherit"/>
                {openLoadingMessage}
            </div>
        </Backdrop>
    }

    const exibirCardCasamento: boolean = form.watch('informacoesPessoais.estadoCivil') === CivilStateEnumV2.CASADO;

    return (
        <div className="mt-4 mb-4 container mx-auto">
            <section>
                <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Solicitação de Membresia</h2>
            </section>
            {
                inviteStatus ? (
                    <InvitationStatus
                        exists={inviteExists}
                        acceptedDate={inviteInfo && inviteInfo.updatedAt ? format(inviteInfo.updatedAt, 'dd/MM/yyyy HH:mm:ss', {locale: ptBR}) : ''}
                        invitedBy={inviteInfo?.requestName}
                        sentDate={inviteInfo && inviteInfo.createdAt ? format(inviteInfo.createdAt, 'dd/MM/yyyy HH:mm:ss', {locale: ptBR}) : ''}
                    />
                ) : (
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
                                                {/* Exibir mensagem de erro */}
                                                {error && <p className="text-red-500 text-sm">{error}</p>}
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
                                                    <FormLabel>Nome *</FormLabel>
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
                                                    <FormLabel>CPF *</FormLabel>
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
                                                    <FormLabel>RG *</FormLabel>
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
                                                    <FormLabel>Email *</FormLabel>
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
                                                    <FormLabel>Telefone *</FormLabel>
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
                                                <FormLabel>Data de Nascimento *</FormLabel>
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

                            {/*SENHA*/}
                            <PasswordSection
                                password={password}
                                setPassword={setPassword}
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                            />

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
                                                <FormLabel>Estado Civil *</FormLabel>
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
                                                                    <FormLabel>Selecione o(a) cônjugue *</FormLabel>
                                                                    <Select onValueChange={field.onChange}
                                                                            defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue
                                                                                    placeholder="Selecione o(a) cônjugue"/>
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {membros.map((member: FormValuesMember, index: number) => (
                                                                                <SelectItem
                                                                                    key={`${member._id}_casamento_${index}`}
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
                                                                    <FormLabel>Cônjuge *</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field}
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
                                                                <FormLabel>Data do Casamento *</FormLabel>
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
                                                                    <PopoverContent className="w-auto p-0"
                                                                                    align="start">
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
                                            <FormItem className="space-y-3">
                                                <FormLabel>Tem filhos?</FormLabel>
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
                                                                    name={`informacoesPessoais.filhos.${index}.id`}
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
                                                                                    {membros.map((member: FormValuesMember, index: number) => (
                                                                                        <SelectItem
                                                                                            key={`${member._id}_filho_${index}`}
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
                                                        <InputMask
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        >
                                                            {(inputProps: any) => <Input{...inputProps} />}
                                                        </InputMask>
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
                                                        <InputMask
                                                            mask="99999-999"
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        >
                                                            {(inputProps: any) => <Input
                                                                placeholder={"99999-999"} {...inputProps} />}
                                                        </InputMask>
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
                                    const result: SafeParseSuccess<FormValuesMember> | SafeParseError<FormValuesMember> = formSchema.safeParse(form.getValues());
                                    console.log(form.getValues());
                                    console.log(result);
                                    const errorMessages: string[] = [];
                                    if (result && result.error && result.error.issues) {
                                        result.error.issues.forEach((errorItem: ZodIssue) => {
                                            errorMessages.push(errorItem.message);
                                        })
                                        alert(errorMessages);
                                    }
                                }}>
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </Form>
                )
            }
        </div>
    )
}