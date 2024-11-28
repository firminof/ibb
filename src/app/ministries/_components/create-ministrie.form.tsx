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
import {useRouter} from "next/navigation"
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

// Sample options for responsáveis (in a real app, this would come from an API)
const responsavelOptions: Responsavel[] = [
    {id: "1", nome: "João da Silva", isMember: true, isDiacono: false},
    {id: "2", nome: "Maria Oliveira", isMember: true, isDiacono: true},
    {id: "3", nome: "Pedro Santos", isMember: true, isDiacono: false},
]

const categoriaOptions = Object.values(MinisterioCategoriasEnum).map(categoria => ({
    value: categoria,
    label: categoria.charAt(0).toUpperCase() + categoria.slice(1)
}))

export default function CreateMinistrieForm() {
    const router = useRouter()
    const [initialMinistry, setInitialMinistry] = useState<Ministry | null>(null)
    const [openResponsavel, setOpenResponsavel] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            categoria: MinisterioCategoriasEnum.coordenacao,
            responsavel: []
        }
    })

    useEffect(() => {
        // Simulating an API call to get an existing ministry for editing
        const fetchInitialMinistry = async () => {
            // In a real scenario, this would be an API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            // Uncomment the following to test editing functionality
            // setInitialMinistry({
            //     nome: "Ministerio fake",
            //     categoria: MinisterioCategoriasEnum.pessoas,
            //     responsavel: [
            //         {
            //             id: "1",
            //             nome: "João da Silva",
            //             isMember: true,
            //             isDiacono: false
            //         }
            //     ]
            // })
        }

        fetchInitialMinistry()
    }, [])

    useEffect(() => {
        if (initialMinistry) {
            form.reset({
                nome: initialMinistry.nome,
                categoria: initialMinistry.categoria,
                responsavel: initialMinistry.responsavel
            })
        }
    }, [initialMinistry, form])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            console.log('Form submitted:', JSON.stringify(data))
            // Here you would typically send the data to your backend
            // await api.createMinistry(data)
            // router.push('/ministrie-list')
        } catch (error) {
            console.error('Error submitting form:', error)
            // Handle error (e.g., show error message to user)
        }
    }

    return (
        <div className="mt-4 mb-4 container mx-auto">
            <section className="mb-6">
                <Button variant="outline" className="mb-4" onClick={() => router.back()}>
                    <ChevronLeftIcon className="mr-2 h-4 w-4"/> Voltar
                </Button>

                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-semibold">{initialMinistry ? 'Editar Ministério' : 'Cadastrar Novo Ministério'}</h2>
                    <Button size="sm" onClick={() => router.push('/ministrie-list')}>
                        <ListIcon className="mr-2 h-4 w-4"/>
                        Lista de Ministérios
                    </Button>
                </div>
            </section>

            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{initialMinistry ? 'Editar Ministério' : 'Cadastrar Novo Ministério'}</CardTitle>
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
                            <Button type="submit" className="w-full">
                                {initialMinistry ? 'Atualizar Ministério' : 'Cadastrar Ministério'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

