'use client'

import * as React from 'react'
import {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {
    Ban,
    Briefcase,
    Calendar,
    Edit,
    Eye,
    Heart,
    ListIcon,
    LogIn,
    LogOut,
    Mail,
    MapPin, MessageCircleIcon,
    Phone,
    Send, SendIcon,
    Skull,
    UserMinus,
    UserPlus,
    Users,
    UserX
} from 'lucide-react'
import {
    formatUserV2,
    FormValuesMember, FormValuesUniqueMember, Historico,
    MinistriesEntity,
    statusColors,
    StatusEnumV2,
    UserRoles,
    UserRolesV2
} from "@/lib/models/user";
import {useRouter, useSearchParams} from "next/navigation";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {UserApi} from "@/lib/api/user-api";
import {IMinistries} from "@/lib/models/user-response-api";
import {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from "date-fns/locale/pt-BR";
import {format, formatDate} from 'date-fns'
import {IInviteEntity} from "@/lib/models/invite";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {WhatsappMessageWithTwilioInput} from "@/lib/models/twilio-whatsapp";
import {Backdrop, CircularProgress} from "@mui/material";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";

// Registrar o local (se necessário)
registerLocale("pt-BR", ptBR);

export default function UserForm() {
    const useStoreIbbZus = useStoreIbb((state: IStore) => state);
    const router = useRouter();
    const [member, setMember] = useState<any | null>(null)
    const [invitations, setInvitations] = useState<IInviteEntity[]>([])

    const [ministerios, setMinisterios] = useState<MinistriesEntity[]>([]);
    const [diaconos, setDiaconos] = useState<FormValuesMember[]>([]);

    const [message, setMessage] = useState('')

    const [openLoading, setLoading] = useState<boolean>(false)
    const [openLoadingMessage, setLoadingMessage] = useState<string>('')

    const searchParams = useSearchParams();
    let idMembro: string | null = searchParams.get('id');

    if (!idMembro) {
        idMembro = useStoreIbbZus.mongoId;
    }
    const handleEdit = () => {
        router.push(`/member?id=${idMembro}`);
    }

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

    const getAllMembersDiaconos = async (): Promise<void> => {
        setLoading(true);
        setLoadingMessage('Carregando...');
        try {
            UserApi.fetchMembersDiaconos()
                .then((response: FormValuesMember[]) => {
                    if (response.length > 0) {
                        setDiaconos(response);
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
                .finally(() => {
                    setLoading(false);
                    setLoadingMessage('');
                })
        } catch (e) {
            setDiaconos([]);
            setLoading(false);
            setLoadingMessage('');
        }
    }

    const getUniqueMember = async (): Promise<void> => {
        try {
            if (idMembro && idMembro.length > 0 && member === null) {
                UserApi.fetchMemberById(idMembro)
                    .then((response: FormValuesMember) => {
                        if (response) {
                            const member: FormValuesMember = formatUserV2(response);
                            setMember(member);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        switch (error.code) {
                            case 'ERR_BAD_REQUEST':
                                setMember(null);
                                break;
                            case 'ERR_NETWORK':
                                setMember(null);
                                break;

                            default:
                                setMember(null);
                                break;
                        }
                    })
            }
        } catch (e) {
            setMember(null);
        }
    }

    const getAllInvites = async (): Promise<void> => {
        try {
            if (idMembro && idMembro.length > 0) {
                UserApi.fetchAllInvitesByMemberId(idMembro)
                    .then((response: IInviteEntity) => {
                        setInvitations(response);
                    })
                    .catch((error) => {
                        console.log(error);
                        switch (error.code) {
                            case 'ERR_BAD_REQUEST':
                                setInvitations([]);
                                break;
                            case 'ERR_NETWORK':
                                setInvitations([]);
                                break;

                            default:
                                setInvitations([]);
                                break;
                        }
                    })
            }
        } catch (e) {
            setInvitations();
        }
    }

    const mapMinisterios = (member: FormValuesMember) => {
        // Filtra os ministérios cujos _id estão no array ids e retorna os nomes correspondentes.
        return ministerios
            .filter((ministerio: MinistriesEntity) => member.ministerio.includes(ministerio._id))
            .map((ministerio: MinistriesEntity): string => ministerio.nome ? ministerio.nome : '-');
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

        if (idMembro && idMembro.length > 0) {
            getUniqueMember();
            return;
        }
    }, [useStoreIbbZus.hasHydrated])

    useEffect(() => {
        getAllMembersDiaconos();
        getAllInvites();
    }, [member]);

    const groupedHistory = member?.historico.reduce((acc, change) => {
        const group = getGroupForField(change.chave);
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(change);
        return acc;
    }, {} as Record<string, Historico[]>);

    function getGroupForField(field: string): string {
        if (field.startsWith('informacoesPessoais')) return 'Informações Pessoais';
        if (field.startsWith('endereco')) return 'Endereço';
        if (field.startsWith('ingresso')) return 'Ingresso';
        if (field.startsWith('transferencia')) return 'Transferência';
        if (field.startsWith('falecimento')) return 'Falecimento';
        if (field.startsWith('exclusao')) return 'Exclusão';
        if (field.startsWith('visitas')) return 'Visitas';
        if (field.startsWith('autenticacao')) return 'Autenticação';
        return 'Informações Básicas';
    }

    function formatFieldName(field: string): string {
        const parts = field.split('.');
        return parts[parts.length - 1]
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    function formatValue(value: any): string {
        if (value === null || value === undefined) {
            return 'Não informado';
        }

        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }

        if (value instanceof Date) {
            return format(value, 'dd/MM/yyyy');
        }

        if (typeof value === 'object') {
            // Verifica se o objeto tem uma propriedade "nome"
            if ('nome' in value && typeof value.nome === 'string') {
                return value.nome;
            }

            // Verifica se é um array e retorna uma representação amigável
            if (Array.isArray(value)) {
                return value.map(formatValue).join(', ');
            }

            // Retorna uma representação mais legível para objetos
            return Object.entries(value)
                .map(([key, val]) => `${key}: ${formatValue(val)}`)
                .join('; ');
        }

        if (String(value).includes('data:image/png;base64')){
            return 'FOTO DE PERFIL ATUALIZADA!';
        }
        // Converte para string para os demais tipos de dados
        return String(value);
    }

    const obterDiaconoMembro = (member: FormValuesMember): FormValuesMember | undefined => {
        console.log('diaconos: ', diaconos);
        return diaconos.find((diacono: FormValuesMember) => member.diacono.id === diacono._id);
    }

    const handleSendMessage = async (member: FormValuesMember) => {
        setMessage('Enviando mensagem ao diácono/diaconisa');
        setLoading(true);

        const diacono: FormValuesMember | undefined = obterDiaconoMembro(member);

        if (!diacono) {
            alert('Você precisa ter um diácono/diaconisa associado para pedir oração, se não tiver peça ao administrador para alterar!');
            setMessage('');
            setLoading(false);
            return;
        }

        try {
            const payload: WhatsappMessageWithTwilioInput = {
                nomeMembro: diacono.nome,
                nomeCompanhia: 'Igreja Batista do Brooklin',
                numeroWhatsapp: diacono.telefone,
                linkAplicacao: '',
                conteudoMensagem: message
            }
            const nomeMembro: string = member.nome.toString();

            UserApi.sendWhatsAppMessagePedirOracao(payload, nomeMembro)
                .then(() => {
                    alert('Pedido de oração enviado com sucesso!');
                })
                .catch(() => {
                    alert('Erro ao enviar pedido de oração , tente novamente');
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
        <div className="container mx-auto py-4 px-4 sm:py-10 sm:px-6">
            {
                member && member.email ? (
                    <>
                        {
                            useStoreIbbZus.role === UserRolesV2.ADMIN && (
                                <section className="w-full max-w-4xl mx-auto">
                                    <Button variant="outline" className="text-black" onClick={() => router.back()}>
                                        <ChevronLeftIcon className="h-4 w-4"/> voltar
                                    </Button>

                                    <div className="flex justify-between items-center">
                                        <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Detalhes do membro</h2>
                                        <div className="flex justify-end items-center gap-4">
                                            <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                                                    onClick={() => router.push('/member')}>
                                                <PlusIcon className="w-4 h-4 mr-1"/>
                                                Adicionar Membro
                                            </Button>
                                            <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                                                    onClick={() => router.push('/member-list')}>
                                                <ListIcon className="w-4 h-4 mr-1"/>
                                                Lista de Membros
                                            </Button>
                                        </div>
                                    </div>
                                </section>
                            )
                        }
                        <Card className="w-full max-w-4xl mx-auto">
                            <CardHeader
                                className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                                <div
                                    className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={member.foto} alt={member.nome}/>
                                        <AvatarFallback>{member.nome.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-center sm:text-left">
                                        <CardTitle className="text-xl sm:text-2xl">{member.nome}</CardTitle>
                                        <CardDescription>{member.email}</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handleEdit} className="w-full sm:w-auto">
                                    <Edit className="mr-2 h-4 w-4"/> Editar
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div
                                    className="flex flex-wrap items-start justify-start sm:justify-start gap-2 flex-col">
                                    {renderStatusBadge(member.status)}
                                    <span>Nível de acesso: <Badge variant="outline">{member.role}</Badge></span>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="z-10"
                                            >
                                                <MessageCircleIcon className="w-4 h-4 mr-2"/>
                                                Pedir Oração ao Diácono/Diaconisa
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Pedir oração ao diácono/diaconisa</DialogTitle>
                                                <DialogDescription>Digite abaixo sua mensagem explicando seu pedido de oração</DialogDescription>
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

                                <Separator/>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">Informações Básicas</h3>
                                        <div className="flex items-center"><Mail
                                            className="mr-2 h-4 w-4"/> {member.email}
                                        </div>
                                        <div className="flex items-center"><Phone
                                            className="mr-2 h-4 w-4"/> {member.telefone}</div>
                                        <div className="flex items-center"><Calendar
                                            className="mr-2 h-4 w-4"/> Nascimento: {format(member.dataNascimento, 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">Documentos</h3>
                                        <div>CPF: {member.cpf}</div>
                                        <div>RG: {member.rg}</div>
                                    </div>
                                </div>

                                <Separator/>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                                    <div>Estado Civil: {member.informacoesPessoais.estadoCivil}</div>
                                    {member.informacoesPessoais.casamento.conjugue && (
                                        <div className="flex flex-wrap items-center">
                                            <Heart className="mr-2 h-4 w-4"/>
                                            <span>Cônjuge: {member.informacoesPessoais.casamento.conjugue.nome}</span>
                                            {member.informacoesPessoais.casamento.dataCasamento && (
                                                <span className="ml-2">
                                                (Data de Casamento: {format(member.informacoesPessoais.casamento.dataCasamento, 'dd/MM/yyyy')})
                                            </span>
                                            )}
                                        </div>
                                    )}
                                    {member.informacoesPessoais.temFilhos && (
                                        <div className="flex items-start">
                                            <Users className="mr-2 h-4 w-4 mt-1"/>
                                            <div>
                                                Filhos: {member.informacoesPessoais.filhos.length > 0 ? member.informacoesPessoais.filhos.map(filho => filho.nome).join(', ') : 'Não informado'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator/>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Cargo e Ministério</h3>
                                    <div className="flex items-center">
                                        <Briefcase
                                            className="mr-2 h-4 w-4"/> Diácono: {member.diacono.nome ? member.diacono.nome : 'Não informado'}
                                    </div>
                                    <div className="flex items-start">
                                        <Users className="mr-2 h-4 w-4 mt-1"/>
                                        <div>
                                            Ministérios: {member.ministerio.length > 0 ? mapMinisterios(member).join(', ') : 'Não informado'}
                                        </div>
                                    </div>
                                </div>

                                <Separator/>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold mb-4">Informações Adicionais</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="bg-blue-50 dark:bg-blue-900">
                                            <CardHeader>
                                                <CardTitle
                                                    className="flex items-center text-blue-700 dark:text-blue-300">
                                                    <UserPlus className="mr-2 h-5 w-5"/>
                                                    Ingresso
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Data: {member.ingresso.data ? format(new Date(member.ingresso.data), 'dd/MM/yyyy') : 'Não informado'}</p>
                                                <p>Forma: {member.ingresso.forma || 'Não informado'}</p>
                                                <p>Local: {member.ingresso.local || 'Não informado'}</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-yellow-50 dark:bg-yellow-900">
                                            <CardHeader>
                                                <CardTitle
                                                    className="flex items-center text-yellow-700 dark:text-yellow-300">
                                                    <UserMinus className="mr-2 h-5 w-5"/>
                                                    Transferência
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Data: {member.transferencia.data ? format(new Date(member.transferencia.data), 'dd/MM/yyyy') : 'Não informado'}</p>
                                                <p>Motivo: {member.transferencia.motivo || 'Não informado'}</p>
                                                <p>Local: {member.transferencia.local || 'Não informado'}</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-red-50 dark:bg-red-900">
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-red-700 dark:text-red-300">
                                                    <Skull className="mr-2 h-5 w-5"/>
                                                    Falecimento
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Data: {member.falecimento.data ? format(new Date(member.falecimento.data), 'dd/MM/yyyy') : 'Não informado'}</p>
                                                <p>Motivo: {member.falecimento.motivo || 'Não informado'}</p>
                                                <p>Local: {member.falecimento.local || 'Não informado'}</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-purple-50 dark:bg-purple-900">
                                            <CardHeader>
                                                <CardTitle
                                                    className="flex items-center text-purple-700 dark:text-purple-300">
                                                    <UserX className="mr-2 h-5 w-5"/>
                                                    Exclusão
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Data: {member.exclusao.data ? format(new Date(member.exclusao.data), 'dd/MM/yyyy') : 'Não informado'}</p>
                                                <p>Motivo: {member.exclusao.motivo || 'Não informado'}</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-green-50 dark:bg-green-900 md:col-span-2">
                                            <CardHeader>
                                                <CardTitle
                                                    className="flex items-center text-green-700 dark:text-green-300">
                                                    <Eye className="mr-2 h-5 w-5"/>
                                                    Visitas
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Motivo: {member.visitas.motivo || 'Não informado'}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <Separator/>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Endereço</h3>
                                    {member.endereco && (
                                        <div className="flex items-start">
                                            <MapPin className="mr-2 h-4 w-4 mt-1"/>
                                            <div>
                                                Rua: {member.endereco.rua ? member.endereco.rua : '-'}, Número: {member.endereco.numero ? member.endereco.numero : '-'}
                                                {member.endereco.complemento && `, ${member.endereco.complemento}`}<br/>
                                                Bairro: {member.endereco.bairro ? member.endereco.bairro : '-'}<br/>
                                                Cidade: {member.endereco.cidade ? member.endereco.cidade : '-'}<br/>
                                                Estado: {member.endereco.estado ? member.endereco.estado : '-'}<br/>
                                                CEP: {member.endereco.cep ? member.endereco.cep : '-'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator/>

                            </CardContent>

                            {
                                member.role === UserRolesV2.ADMIN && (
                                    <CardFooter>
                                        <div className="w-full space-y-4">
                                            <h3 className="text-lg font-semibold">Convites Enviados</h3>
                                            {invitations.length > 0 ? (
                                                <ul className="space-y-4">
                                                    {invitations.map((invitation: IInviteEntity, index: number) => (
                                                        <>
                                                            <li key={index}
                                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                                <div className="flex items-center">
                                                                    <Send className="mr-2 h-4 w-4"/>
                                                                    <span>{invitation.to === '' ? invitation.phone : invitation.to}</span>
                                                                </div>
                                                                <div
                                                                    className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        {format(invitation.createdAt, 'dd/MM/yyyy HH:mm:ss')}
                                                    </span>
                                                                    <span
                                                                        className={`text-sm text-muted-foreground px-2 py-1 rounded-full font-semibold ${invitation.isAccepted ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                        {invitation.isAccepted ? 'CONVITE ACEITO' : 'CONVITE PENDENTE DE ACEITAÇÃO'}
                                                    </span>
                                                                </div>
                                                            </li>
                                                            {
                                                                invitations.length > 1 && (<Separator/>)
                                                            }
                                                        </>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>Nenhum convite enviado.</p>
                                            )}
                                        </div>
                                    </CardFooter>
                                )
                            }

                            <CardFooter>
                                {/* Histórico de Alterações */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold mb-4">Histórico de Alterações</h3>
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                        <div className="p-6">
                                            {Object.entries(groupedHistory).length > 0 ? (
                                                Object.entries(groupedHistory).map(([group, changes]) => (
                                                    <div key={group} className="mb-8 last:mb-0">
                                                        <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{group}</h4>
                                                        <div className="space-y-4">
                                                            {changes.map((change, index) => (
                                                                <div
                                                                    key={`${change.chave}_${index}`}
                                                                    className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="space-y-2">
                                                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                                <b>Campo alterado:</b> {formatFieldName(change.chave)}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                <b>Valor anterior:</b> {formatValue(change.antigo)}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                <b>Novo valor:</b> {formatValue(change.novo)}
                                                                            </p>
                                                                        </div>
                                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                            {format(new Date(change.updatedAt), 'dd/MM/yyyy HH:mm')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400">Nenhuma alteração recente.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardFooter>
                            <CardFooter>
                                Última atualização: {format(new Date(member.updatedAt), 'dd/MM/yyyy HH:mm:ss')}
                            </CardFooter>
                        </Card>
                    </>
                ) : (
                    <p>Membro não encontrado.</p>
                )
            }
        </div>
    )
}

