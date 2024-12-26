'use client'

import * as React from 'react'
import {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {Eye, Filter, MessageCircleIcon, RefreshCw, SendIcon, ViewIcon} from 'lucide-react'
import {format} from 'date-fns'
import * as z from "zod"
import {FormValuesMember, statusColors, StatusEnumV2, UserRoles} from "@/lib/models/user"
import InputMask, {Props as InputMaskProps} from "react-input-mask"
import {useRouter} from "next/navigation"
import {UserApi} from "@/lib/api/user-api"
import {IMinistries} from "@/lib/models/user-response-api"
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Backdrop, CircularProgress} from "@mui/material"
import ptBR from "date-fns/locale/pt-BR"
import {Card, CardContent} from "@/components/ui/card"
import {IMesAtual} from "@/lib/models/mes-atual";
import {obterMesAtual} from "@/lib/helpers/helpers";
import {Textarea} from "@/components/ui/textarea";
import {WhatsappMessageWithTwilioInput} from "@/lib/models/twilio-whatsapp";

const memberSchema = z.object({
    id: z.string().nullable(),
    nome: z.string().nullable(),
    isMember: z.boolean(),
    isDiacono: z.boolean(),
})

// Enum para MinisterioCategoriasEnum
const MinisterioCategoriasEnum = z.enum(['eclesiastico', 'pessoas', 'coordenacao'])

// Schema para MinistrieEntity
const MinistrieEntitySchema = z.object({
    _id: z.string().optional(),
    nome: z.string(),
    categoria: MinisterioCategoriasEnum,
    responsavel: z.array(memberSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
})

// Uso do schema
type MinistriesEntity = z.infer<typeof MinistrieEntitySchema>

export default function BirthdaysV2() {
    const useStoreIbbZus = useStoreIbb((state: IStore) => state)
    const router = useRouter()

    const [ministerios, setMinisterios] = useState<MinistriesEntity[]>([])
    const [membros, setMembros] = useState<FormValuesMember[]>([])

    const [openLoading, setLoading] = useState<boolean>(false)
    const [openLoadingMessage, setLoadingMessage] = useState<string>('')

    const {codigo: codigoMes, descricao: nomeMes}: IMesAtual = obterMesAtual();

    const [message, setMessage] = useState('')

    const [filteredMembers, setFilteredMembers] = useState<FormValuesMember[]>([])
    const [filters, setFilters] = useState({
        nome: '',
        telefone: '',
        isDiacono: 'all',
        mesAniversario: `${codigoMes}`,
    })

    useEffect(() => {
        const filtered: FormValuesMember[] = membros.filter(member =>
            member.nome.toLowerCase().includes(filters.nome.toLowerCase()) &&
            member.telefone.includes(filters.telefone) &&
            (filters.isDiacono === 'all' || member.isDiacono.toString() === filters.isDiacono) &&
            (filters.mesAniversario === 'all' || new Date(member.dataNascimento).getMonth() + 1 === parseInt(filters.mesAniversario))
        )
        setFilteredMembers(filtered)
    }, [membros, filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({...prev, [key]: value}))
    }

    const handleReloadTable = () => {
        fetchMembers()
    }
    const renderStatusBadge = (status: StatusEnumV2): JSX.Element => {
        const colorClass = statusColors[status] || 'bg-gray-100 text-gray-500'

        return (
            <span
                className={`px-2 py-1 rounded-full text-sm font-semibold ${colorClass}`}
            >
                {status.toUpperCase()}
            </span>
        )
    }

    const fetchMembers = async () => {
        if (useStoreIbbZus.hasHydrated && useStoreIbbZus.role === UserRoles.MEMBRO) {
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

        getAllMinistries()
        getAllMembers()
    }

    useEffect(() => {
        setLoading(true)
        setLoadingMessage('Carregando...')
        fetchMembers()
    }, [useStoreIbbZus.hasHydrated])

    const getAllMinistries = () => {
        setLoading(true)
        setLoadingMessage('Carregando...')
        try {
            UserApi.fetchMinistries()
                .then((response: IMinistries[]) => {
                    if (response && response.length > 0) {
                        setMinisterios(response)
                        return
                    }

                    setMinisterios([])
                })
                .catch((error: any) => {
                    console.log(error)
                    setMinisterios([])

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            break
                        case 'ERR_NETWORK':
                            break

                        default:
                            break
                    }
                })
                .finally(() => {
                    setLoading(false)
                    setLoadingMessage('')
                })
        } catch (e) {
            setMinisterios([])
            setLoading(false)
            setLoadingMessage('')
        }
    }

    const getAllMembers = async (): Promise<void> => {
        setLoading(true);
        setLoadingMessage('Carregando...');
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
                    setLoadingMessage('');
                })
        } catch (e) {
            setMembros([]);
            setLoading(false);
            setLoadingMessage('');
        }
    }

    const mapMinisterios = (member: FormValuesMember): string => {
        return ministerios
            .filter(
                (ministerio: MinistriesEntity) =>
                    member && member.ministerio && Array.isArray(member.ministerio) && ministerio._id && member.ministerio.includes(ministerio._id)
            )
            .map((ministerio: MinistriesEntity): string => (ministerio.nome ? ministerio.nome : '-'))
            .join(', ');
    };

    const mapearNomeMes = (codigo: string): string => {
        if (codigo === 'all') {
            return 'TODOS OS MESES';
        }

        const meses: {codigo: number; descricao: string}[] = [
            {codigo: 1, descricao: 'Janeiro'},
            {codigo: 2, descricao: 'Fevereiro'},
            {codigo: 3, descricao: 'Março'},
            {codigo: 4, descricao: 'Abril'},
            {codigo: 5, descricao: 'Maio'},
            {codigo: 6, descricao: 'Junho'},
            {codigo: 7, descricao: 'Julho'},
            {codigo: 8, descricao: 'Agosto'},
            {codigo: 9, descricao: 'Setembro'},
            {codigo: 10, descricao: 'Outubro'},
            {codigo: 11, descricao: 'Novembro'},
            {codigo: 12, descricao: 'Dezembro'},
        ]

        return meses[parseInt(codigo, 10) - 1].descricao.toUpperCase();
    }

    const handleSendMessage = async (member: FormValuesMember) => {
        setLoading(true);
        setLoadingMessage('Enviando mensagem de parabéns');

        try {
            const payload: WhatsappMessageWithTwilioInput = {
                nomeMembro: member.nome,
                nomeCompanhia: 'Igreja Batista do Brooklin',
                numeroWhatsapp: member.telefone,
                linkAplicacao: '',
                conteudoMensagem: message
            }
            UserApi.sendWhatsAppMessage(payload)
                .then(() => {
                    alert('Mensagem de parabéns enviado com sucesso!');
                })
                .catch(() => {
                    alert('Erro ao enviar mensagem de parabéns, tente novamente');
                })
                .finally(() => {
                    setMessage('');
                    setMessage('');
                    setLoading(false);
                })
        } catch (e) {
            setMessage('');
            setLoading(false);
            setLoadingMessage('');
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
        <div className="py-10">
            <section>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-black text-2xl font-semibold mb-4 mt-4">Aniversariantes de {mapearNomeMes(filters.mesAniversario)}</h2>

                    <div className="space-y-2">
                        <Label htmlFor="mesAniversario">Mês de Aniversário</Label>
                        <Select
                            value={filters.mesAniversario}
                            onValueChange={(value) => handleFilterChange('mesAniversario', value)}
                        >
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Mês de Aniversário"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="1">Janeiro</SelectItem>
                                <SelectItem value="2">Fevereiro</SelectItem>
                                <SelectItem value="3">Março</SelectItem>
                                <SelectItem value="4">Abril</SelectItem>
                                <SelectItem value="5">Maio</SelectItem>
                                <SelectItem value="6">Junho</SelectItem>
                                <SelectItem value="7">Julho</SelectItem>
                                <SelectItem value="8">Agosto</SelectItem>
                                <SelectItem value="9">Setembro</SelectItem>
                                <SelectItem value="10">Outubro</SelectItem>
                                <SelectItem value="11">Novembro</SelectItem>
                                <SelectItem value="12">Dezembro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                                <Label htmlFor="telefone">Telefone</Label>
                                <InputMask
                                    id="telefone"
                                    mask="(99) 99999-9999"
                                    value={filters.telefone}
                                    onChange={(e) => handleFilterChange('telefone', e.target.value)}
                                >
                                    {(inputProps: InputMaskProps) => <Input
                                        placeholder={"(99) 99999-9999"} {...inputProps} />}
                                </InputMask>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end mb-5">
                <Button variant="outline" onClick={handleReloadTable}>
                    <RefreshCw className="mr-2 h-4 w-4"/> Recarregar
                </Button>
            </div>

            {filteredMembers.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-xl text-gray-500">Lista de membros que fazem aniversário
                        em {mapearNomeMes(filters.mesAniversario)} está vazia!</p>
                </div>
            ) : (
                <Card className="w-full">
                    <CardContent className="p-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Data de Nascimento</TableHead>
                                    <TableHead>Idade</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>Ministério</TableHead>
                                    <TableHead>Diácono</TableHead>
                                    <TableHead>Última Atualização</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.map((member: FormValuesMember) => (
                                    <TableRow key={member._id} className="group">
                                        <TableCell className="relative group">
                                            {/* Imagem do membro */}
                                            <span className="block">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={member.foto} alt={member.nome}/>
                                            <AvatarFallback>{member.nome.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </span>

                                            {/* Ícone sobreposto no hover */}
                                            <div
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <ViewIcon className="w-6 h-6 text-white cursor-pointer"/>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Foto de: {member?.nome}</DialogTitle>
                                                        </DialogHeader>
                                                        <Avatar className="w-96 h-96">
                                                            <AvatarImage src={member.foto} alt={member.nome}/>
                                                            <AvatarFallback>{member.nome.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.nome}</TableCell>
                                        <TableCell>{format(member.dataNascimento, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{member.idade}</TableCell>
                                        <TableCell>{member.telefone}</TableCell>
                                        <TableCell className="relative group">
                                            {/* Badge de status */}
                                            <span>{renderStatusBadge(member.status)}</span>
                                        </TableCell>

                                        <TableCell>{member.role}</TableCell>
                                        <TableCell>{mapMinisterios(member)}</TableCell>
                                        <TableCell>{member.diacono.nome}</TableCell>
                                        <TableCell>{format(member.updatedAt, 'dd/MM/yyyy HH:MM:ss', {locale: ptBR})}</TableCell>


                                        <TableCell>
                                            <Button variant="outline" size="icon"
                                                    onClick={() => router.push(`/user?id=${member._id.toString()}`)}>
                                                <Eye className="h-4 w-4"/>
                                            </Button>

                                            <div className="flex space-x-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="z-10"
                                                        >
                                                            <MessageCircleIcon className="w-4 h-4 mr-2"/>
                                                            Enviar parabéns
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Enviar Parabéns ao membro: {member.nome}</DialogTitle>
                                                            <DialogDescription>Mande uma mensagem parabenizando o membro</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <Textarea
                                                                placeholder="Digite sua mensagem aqui..."
                                                                value={message}
                                                                onChange={(e) => setMessage(e.target.value)}
                                                                className="min-h-[100px]"
                                                            />
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="submit" onClick={() => handleSendMessage(member)}>
                                                                <SendIcon className="w-4 h-4 mr-2"/>
                                                                Enviar
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
