'use client'

import {useState, useEffect} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Checkbox} from "@/components/ui/checkbox"
import {MemberTableData} from '@/lib/types/user'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {RefreshCw, Trash, UserCog, Filter, Eye, Edit} from 'lucide-react'
import {format} from 'date-fns'
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {statusColors, StatusEnumV2, UserRolesV2} from "@/lib/models/user";
import * as React from "react";
import InputMask from "react-input-mask";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {useRouter} from "next/navigation";

// Status validation schema
const statusUpdateSchema = z.object({
    status: z.nativeEnum(StatusEnumV2),
    visitante: z.object({
        motivo: z.string({required_error: "Motivo é obrigatório"}).min(1).nullable(),
    }).optional(),
    ingresso: z.object({
        data: z.string({required_error: "Data de ingresso é obrigatória"}).nullable(),
        forma: z.string({required_error: "Forma é obrigatória"}).min(1).nullable(),
        local: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
    transferido: z.object({
        data: z.string({required_error: "Data de transferência é obrigatória"}).nullable(),
        motivo: z.string({required_error: "Motivo é obrigatório"}).min(1).nullable(),
        local: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
    falecido: z.object({
        data: z.string({required_error: "Data de falecimento é obrigatória"}).nullable(),
        motivo: z.string({required_error: "Motivo é obrigatória"}).min(1).nullable(),
        local: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
    excluido: z.object({
        data: z.string({required_error: "Data de exclusão é obrigatória"}).nullable(),
        motivo: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
});

// Sample data
const sampleMembers: MemberTableData[] = [
    {
        _id: '1',
        nome: 'João Silva',
        status: StatusEnumV2.ativo,
        role: UserRolesV2.MEMBRO,
        updatedAt: new Date('2023-05-15'),
        dataNascimento: new Date('1988-03-10'),
        ministerio: ['Louvor', 'Jovens'],
        diacono: {id: '101', nome: 'Carlos Santos', isMember: true, isDiacono: true},
        idade: 35,
        cpf: '123.456.789-00',
        rg: '1234567',
        telefone: '(11) 98765-4321',
        email: 'joao.silva@example.com',
        isDiacono: false,
    },
    {
        _id: '2',
        nome: 'Maria Santos',
        status: StatusEnumV2.inativo,
        role: UserRolesV2.ADMIN,
        updatedAt: new Date('2023-06-20'),
        dataNascimento: new Date('1981-09-22'),
        ministerio: ['Ensino', 'Mulheres'],
        diacono: {id: '102', nome: 'Ana Oliveira', isMember: true, isDiacono: true},
        idade: 42,
        cpf: '987.654.321-00',
        rg: '7654321',
        telefone: '(11) 91234-5678',
        email: 'maria.santos@example.com',
        isDiacono: true,
    },
    {
        _id: '3',
        nome: 'Pedro Oliveira',
        status: StatusEnumV2.congregado,
        role: UserRolesV2.MEMBRO,
        updatedAt: new Date('2023-07-05'),
        dataNascimento: new Date('1995-11-30'),
        ministerio: ['Evangelismo'],
        diacono: {id: '103', nome: 'José Ferreira', isMember: true, isDiacono: true},
        idade: 28,
        cpf: '456.789.123-00',
        rg: '3456789',
        telefone: '(11) 94567-8901',
        email: 'pedro.oliveira@example.com',
        isDiacono: false,
    },
]

export default function MemberListing() {
    const router = useRouter();
    const [members, setMembers] = useState<MemberTableData[]>(sampleMembers)
    const [filteredMembers, setFilteredMembers] = useState<MemberTableData[]>(sampleMembers)
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [filters, setFilters] = useState({
        nome: '',
        cpf: '',
        rg: '',
        telefone: '',
        email: '',
        isDiacono: 'all',
    })
    const [selectedMember, setSelectedMember] = useState<MemberTableData | null>(null)
    const [newStatus, setNewStatus] = useState<StatusEnumV2 | null>(null)
    const [statusUpdateData, setStatusUpdateData] = useState<any>({})
    const form = useForm({
        resolver: zodResolver(statusUpdateSchema),
        defaultValues: {
            status: "ativo",
            ingresso: {data: null, forma: null, local: null},
            transferido: {data: null, motivo: null, local: null},
            falecido: {data: null, motivo: null, local: null},
            excluido: {data: null, motivo: null},
            visitante: {motivo: null},
        },
    });

    useEffect(() => {
        const filtered = members.filter(member =>
            member.nome.toLowerCase().includes(filters.nome.toLowerCase()) &&
            member.cpf.includes(filters.cpf) &&
            member.rg.includes(filters.rg) &&
            member.telefone.includes(filters.telefone) &&
            member.email.toLowerCase().includes(filters.email.toLowerCase()) &&
            (filters.isDiacono === 'all' || member.isDiacono.toString() === filters.isDiacono)
        )
        setFilteredMembers(filtered)
    }, [members, filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({...prev, [key]: value}))
    }

    const handleSelectMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
        )
    }

    const handleDeleteSelected = () => {
        console.log('Deleting members:', selectedMembers)
    }

    const handleRequestUpdate = () => {
        console.log('Requesting update for members:', selectedMembers)
    }

    const handleReloadTable = () => {
        console.log('Reloading table')
    }

    const handleStatusChange = (member: MemberTableData) => {
        setSelectedMember(member)
        form.reset({
            status: member.status,
        })
    }


    const handleStatusUpdateSubmit = (data: any) => {
        console.log("Form Data:", data);
        const result = statusUpdateSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.format();
            console.error("Validation Errors:", errors);
            alert(
                "Existem erros no formulário:\n" +
                JSON.stringify(errors, null, 2)
            );
        } else {
            alert("Formulário válido! Dados enviados com sucesso.");
        }
    };

    // Função para renderizar a `span`
    const renderStatusBadge = (status: StatusEnumV2): JSX.Element => {
        const colorClass = statusColors[status] || 'bg-gray-100 text-gray-500'; // Cor padrão se o status não for encontrado

        return (
            <span
                className={`px-2 py-1 rounded-full text-sm font-semibold ${colorClass}`}
            >
            {status.toUpperCase()}
        </span>
        );
    };

    return (
        <div className="container mx-auto py-10">
            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>

                <div className="flex justify-between items-center">
                    <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Membros</h2>
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                            onClick={() => router.push('/member')}>
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        Adicionar Membro
                    </Button>
                </div>
            </section>

            <Accordion type="single" collapsible className="mb-5">
                <AccordionItem value="filters">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <Filter className="mr-2"/>
                            Filtros
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id='nome'
                                    placeholder="Nome"
                                    value={filters.nome}
                                    onChange={(e) => handleFilterChange('nome', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <InputMask
                                    id="cpf"
                                    mask="999.999.999-99"
                                    value={filters.cpf}
                                    onChange={(e) => handleFilterChange('cpf', e.target.value)}
                                >
                                    {(inputProps: any) => <Input
                                        placeholder={"999.999.999-99"} {...inputProps} />}
                                </InputMask>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rg">RG</Label>
                                <InputMask
                                    id="rg"
                                    mask="999.999.999"
                                    value={filters.rg}
                                    onChange={(e) => handleFilterChange('rg', e.target.value)}
                                >
                                    {(inputProps: any) => <Input
                                        placeholder={"999.999.999"} {...inputProps} />}
                                </InputMask>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <InputMask
                                    id="telefone"
                                    mask="(99) 99999-9999"
                                    value={filters.telefone}
                                    onChange={(e) => handleFilterChange('telefone', e.target.value)}
                                >
                                    {(inputProps: any) => <Input
                                        placeholder={"(99) 99999-9999"} {...inputProps} />}
                                </InputMask>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diacono">É Diácono</Label>
                                <Select
                                    id="diacono"
                                    value={filters.isDiacono}
                                    onValueChange={(value) => handleFilterChange('isDiacono', value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Diácono"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="true">Sim</SelectItem>
                                        <SelectItem value="false">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-between mb-5">
                <div className="space-x-2">
                    <Button
                        variant="destructive"
                        onClick={handleDeleteSelected}
                        disabled={selectedMembers.length === 0}
                    >
                        <Trash className="mr-2 h-4 w-4"/> Deletar Selecionados
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRequestUpdate}
                        disabled={selectedMembers.length === 0}
                    >
                        <UserCog className="mr-2 h-4 w-4"/> Solicitar Atualização
                    </Button>
                </div>
                <Button variant="outline" onClick={handleReloadTable}>
                    <RefreshCw className="mr-2 h-4 w-4"/> Recarregar Tabela
                </Button>
            </div>

            {filteredMembers.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-xl text-gray-500">Nenhum membro encontrado.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Data de Nascimento</TableHead>
                            <TableHead>Idade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>É Diácono</TableHead>
                            <TableHead>Ministério</TableHead>
                            <TableHead>Diácono</TableHead>
                            <TableHead>Última Atualização</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.map((member) => (
                            <TableRow key={member._id} className="group">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMembers.includes(member._id)}
                                        onCheckedChange={() => handleSelectMember(member._id)}
                                    />
                                </TableCell>
                                <TableCell>{member.nome}</TableCell>
                                <TableCell>{format(member.dataNascimento, 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{member.idade}</TableCell>
                                <TableCell className="relative">
                                    <span>{renderStatusBadge(member.status)}</span>
                                    <div
                                        className="absolute w-full inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm"
                                                        onClick={() => handleStatusChange(member)}>
                                                    Alterar Status
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Alterar Status de {selectedMember?.nome}</DialogTitle>
                                                </DialogHeader>
                                                <Form {...form}>
                                                    <form onSubmit={form.handleSubmit(handleStatusUpdateSubmit)}
                                                          className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="status"
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Novo Status</FormLabel>
                                                                    <Select onValueChange={field.onChange}
                                                                            defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue
                                                                                    placeholder="Selecione o status"/>
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
                                                        {
                                                            form.watch('status') === StatusEnumV2.ativo && (
                                                                <>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="ingresso.data"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Data</FormLabel>
                                                                                <FormControl>
                                                                                    <Input type="date" {...field}
                                                                                           value={field.value ? new Date(field.value).toISOString().substr(0, 10) : ''}/>
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="ingresso.forma"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Forma</FormLabel>
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
                                                                                <FormLabel>Local</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </>
                                                            )
                                                        }

                                                        {/*STATUS TRANFERENCIA*/}
                                                        {
                                                            form.watch('status') === StatusEnumV2.transferido && (
                                                                <>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="transferido.data"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Data</FormLabel>
                                                                                <FormControl>
                                                                                    <Input type="date" {...field}
                                                                                           value={field.value ? new Date(field.value).toISOString().substr(0, 10) : ''}/>
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="transferido.motivo"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Motivo</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="transferido.local"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Local</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </>
                                                            )
                                                        }

                                                        {/*STATUS FALECIDO*/}
                                                        {
                                                            form.watch('status') === StatusEnumV2.falecido && (
                                                                <>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="falecido.data"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Data</FormLabel>
                                                                                <FormControl>
                                                                                    <Input type="date" {...field}
                                                                                           value={field.value ? new Date(field.value).toISOString().substr(0, 10) : ''}/>
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="falecido.motivo"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Motivo</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="falecido.local"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Local</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </>
                                                            )
                                                        }

                                                        {/*STATUS EXCLUSAO*/}
                                                        {
                                                            form.watch('status') === StatusEnumV2.excluido && (
                                                                <>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="excluido.data"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Data</FormLabel>
                                                                                <FormControl>
                                                                                    <Input type="date" {...field}
                                                                                           value={field.value ? new Date(field.value).toISOString().substr(0, 10) : ''}/>
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="excluido.motivo"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Motivo</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </>
                                                            )
                                                        }

                                                        {/*STATUS VISITANTE*/}
                                                        {
                                                            form.watch('status') === StatusEnumV2.visitante && (
                                                                <>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="visitante.motivo"
                                                                        render={({field}) => (
                                                                            <FormItem>
                                                                                <FormLabel>Motivo</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} />
                                                                                </FormControl>
                                                                                <FormMessage/>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </>
                                                            )
                                                        }
                                                        <Button type="submit">Salvar Alterações</Button>
                                                    </form>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </TableCell>

                                <TableCell>{member.role}</TableCell>
                                <TableCell>{member.isDiacono ? 'Sim' : 'Não'}</TableCell>
                                <TableCell>{member.ministerio.join(', ')}</TableCell>
                                <TableCell>{member.diacono.nome}</TableCell>
                                <TableCell>{format(member.updatedAt, 'dd/MM/yyyy hh:mm:ss')}</TableCell>


                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => console.log(member)}>
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => console.log(member)}>
                                            <Edit className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

