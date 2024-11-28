'use client'

import {useState, useEffect} from 'react'
import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ChevronLeftIcon, ListIcon} from 'lucide-react'
import {useRouter, useSearchParams} from "next/navigation"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem, CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {Check, ChevronsUpDown} from 'lucide-react'
import {cn} from "@/lib/utils"
import {UserApi} from "@/lib/api/user-api";
import {dataForm, FormValuesMember} from "@/lib/models/user";
import {Backdrop, CircularProgress} from "@mui/material";
import * as React from "react";

// Define the types
interface Responsavel {
    id: string
    nome: string
    isMember: boolean
    isDiacono: boolean
}

export enum MinisterioCategoriasEnum {
    eclesiastico = 'eclesiastico',
    pessoas = 'pessoas',
    coordenacao = 'coordenacao',
}

interface Ministry {
    nome: string
    categoria: MinisterioCategoriasEnum
    responsavel: Responsavel[]
}

// Define the form schema with improved validation
const formSchema = z.object({
    nome: z.string().min(3, {message: "O nome do ministério deve ter pelo menos 3 caracteres"}).max(100, {message: "O nome do ministério não pode exceder 100 caracteres"}),
    categoria: z.nativeEnum(MinisterioCategoriasEnum, {
        errorMap: () => ({message: "Selecione uma categoria válida"}),
    }),
    responsavel: z.array(z.object({
        id: z.string(),
        nome: z.string(),
        isMember: z.boolean(),
        isDiacono: z.boolean()
    })).min(1, {message: "Selecione pelo menos um responsável"}).max(5, {message: "Não é possível selecionar mais de 5 responsáveis"})
})

const categoriaOptions = Object.values(MinisterioCategoriasEnum).map(categoria => ({
    value: categoria,
    label: categoria.charAt(0).toUpperCase() + categoria.slice(1)
}))

export default function CreateMinistrieForm() {
    const router = useRouter()
    const [initialMinistry, setInitialMinistry] = useState<Ministry | null>(null)
    const [openResponsavel, setOpenResponsavel] = useState(false)
    const [responsavelOptions, setResponsavelOptions] = useState<Responsavel[]>([])

    const [openLoading, setLoading] = useState<boolean>(false);
    const [openLoadingMessage, setLoadingMessage] = useState<string>('');

    const searchParams = useSearchParams()

    const idMinisterio: string | null = searchParams.get('id')

    const isEditing: boolean = idMinisterio && idMinisterio.length === 24;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            categoria: MinisterioCategoriasEnum.coordenacao,
            responsavel: []
        }
    })

    useEffect(() => {
        const fetchInitialMinistry = async () => {
            if (isEditing && idMinisterio && idMinisterio.length === 24) {
                try {
                    UserApi.fetchMinistrieById(idMinisterio)
                        .then((response) => {
                            console.log(response)
                            setInitialMinistry({
                                nome: response.nome,
                                categoria: response.categoria,
                                responsavel: response.responsavel
                            })
                        })
                        .catch((error) => {
                            console.log(error);
                            switch (error.code) {
                                case 'ERR_BAD_REQUEST':
                                    setInitialMinistry({
                                        nome: '',
                                        categoria: 'pessoas',
                                        responsavel: []
                                    })
                                    break;
                                case 'ERR_NETWORK':
                                    setInitialMinistry({
                                        nome: '',
                                        categoria: 'pessoas',
                                        responsavel: []
                                    })
                                    break;

                                default:
                                    setInitialMinistry({
                                        nome: '',
                                        categoria: 'pessoas',
                                        responsavel: []
                                    })
                                    break;
                            }
                        })
                        .finally(() => {
                            setLoading(false);
                            setLoadingMessage('');
                        })
                } catch (e) {
                    setInitialMinistry({
                        nome: '',
                        categoria: 'pessoas',
                        responsavel: []
                    })
                    setLoading(false);
                    setLoadingMessage('');
                }
            }
        }

        const getAllMembers = async (): Promise<void> => {
            try {
                UserApi.fetchMembers()
                    .then((response: FormValuesMember[]) => {
                        if (response.length > 0) {
                            const membros: Responsavel[] = response.map((membro: FormValuesMember) => (
                                {
                                    nome: membro.nome,
                                    isMember: true,
                                    id: membro._id.toString(),
                                    isDiacono: membro.isDiacono
                                }
                            ))
                            setResponsavelOptions(membros);
                            return;
                        }

                        setResponsavelOptions([]);
                    })
                    .catch((error) => {
                        console.log(error);
                        switch (error.code) {
                            case 'ERR_BAD_REQUEST':
                                setResponsavelOptions([]);
                                break;
                            case 'ERR_NETWORK':
                                setResponsavelOptions([]);
                                break;

                            default:
                                setResponsavelOptions([]);
                                break;
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                        setLoadingMessage('');
                    })
            } catch (e) {
                setResponsavelOptions([]);
                setLoading(false);
                setLoadingMessage('');
            }
        }

        fetchInitialMinistry();
        getAllMembers();
        setLoading(false);
        setLoadingMessage('');
    }, [])

    useEffect(() => {
        if (initialMinistry) {
            form.reset({
                nome: initialMinistry.nome,
                categoria: initialMinistry.categoria,
                responsavel: initialMinistry.responsavel
            })
        }
        setLoading(false);
        setLoadingMessage('');
    }, [initialMinistry, form])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setLoading(true);
        setLoadingMessage(idMinisterio && idMinisterio.length === 24 ? 'Editando ministério' : 'Salvando ministério');

        try {
            if (isEditing && idMinisterio && idMinisterio.length === 24) {
                await UserApi.editMinistrie(idMinisterio, data);
                alert('Ministério editado com sucesso!');
                setLoading(false);
                setLoadingMessage('');
                router.push('/ministrie-list')
                return;
            }

            await UserApi.createMinistrie(data);
            alert('Ministério cadastrado com sucesso!');
            setLoading(false);
            setLoadingMessage('');
            router.push('/ministrie-list')
        } catch (error) {
            console.error('Error submitting form:', error)
            setLoading(false);
            setLoadingMessage('')
            alert(`Erro: ${error.response.data.message}!`)
            // Handle error (e.g., show error message to user)
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

    return (
        <div className="mt-4 mb-4 container mx-auto">
            <section className="mb-6">
                <Button variant="outline" className="mb-4" onClick={() => router.back()}>
                    <ChevronLeftIcon className="mr-2 h-4 w-4"/> Voltar
                </Button>

                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-semibold">{isEditing ? 'Editar Ministério' : 'Cadastrar Novo Ministério'}</h2>
                    <Button size="sm" onClick={() => router.push('/ministrie-list')}>
                        <ListIcon className="mr-2 h-4 w-4"/>
                        Lista de Ministérios
                    </Button>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Editar Ministério' : 'Cadastrar Novo Ministério'}</CardTitle>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Nome do Ministério</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoria"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma categoria"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categoriaOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="responsavel"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Responsáveis</FormLabel>
                                        <Popover open={openResponsavel} onOpenChange={setOpenResponsavel}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openResponsavel}
                                                        className="w-full justify-between"
                                                    >
                                                        {Array.isArray(field.value) && field.value.length > 0
                                                            ? `${field.value.length} responsável(is) selecionado(s)`
                                                            : "Selecione responsáveis"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Procurar responsável..."/>
                                                    <CommandEmpty>Nenhum responsável encontrado.</CommandEmpty>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {responsavelOptions.map((responsavel: Responsavel) => (
                                                                <CommandItem
                                                                    key={responsavel.id}
                                                                    onSelect={() => {
                                                                        const currentValue = Array.isArray(field.value) ? field.value : []
                                                                        const newValue = currentValue.some((item: Responsavel) => item.id === responsavel.id)
                                                                            ? currentValue.filter((item: Responsavel) => item.id !== responsavel.id)
                                                                            : [...currentValue, responsavel]
                                                                        form.setValue('responsavel', newValue, {shouldValidate: true})
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            Array.isArray(field.value) && field.value.some((item: Responsavel) => item.id === responsavel.id)
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {responsavel.nome}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <div className="flex flex-1 justify-end mt-4 mb-4">
                                <Button type="submit" className="ml-auto">
                                    {isEditing ? 'Atualizar Ministério' : 'Cadastrar Ministério'}
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

