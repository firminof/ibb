'use client'

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
    Heart,
    LogIn,
    LogOut,
    Mail,
    MapPin,
    Phone,
    Send,
    Skull,
    Users
} from 'lucide-react'
import {statusColors, StatusEnumV2, UserRoles} from "@/lib/models/user";
import {useRouter, useSearchParams} from "next/navigation";
import {FormValuesMember, MinistriesEntity} from "@/app/member/_components/member-create-update.form";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {UserApi} from "@/lib/api/user-api";
import {IMinistries} from "@/lib/models/user-response-api";
import {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from "date-fns/locale/pt-BR";
import {format, formatDate} from 'date-fns'
import {IInviteEntity} from "@/lib/models/invite";
import * as React from "react";

// Registrar o local (se necessário)
registerLocale("pt-BR", ptBR);

export default function UserForm() {
    const useStoreIbbZus = useStoreIbb((state: IStore) => state);
    const router = useRouter();
    const [member, setMember] = useState<FormValuesMember | null>(null)
    const [invitations, setInvitations] = useState<IInviteEntity[]>([])

    const [ministerios, setMinisterios] = useState<MinistriesEntity[]>([]);

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

    const formatDateShort = (date: string) => {
        return new Date(formatDate(new Date(date).setDate(new Date(date).getDate() + 1), 'yyyy-MM-dd', {locale: ptBR}))
    }

    const getUniqueMember = async (): Promise<void> => {
        try {
            if (idMembro && idMembro.length > 0 && member === null) {
                UserApi.fetchMemberById(idMembro)
                    .then((response: FormValuesMember) => {
                        if (response) {
                            response.dataNascimento = formatDateShort(response.dataNascimento);
                            response.exclusao = response.exclusao.data ? formatDateShort(response.exclusao) : null;
                            response.transferencia = response.transferencia.data ? formatDateShort(response.transferencia) : null;
                            response.falecimento = response.falecimento.data ? formatDateShort(response.falecimento) : null;
                            response.informacoesPessoais.casamento.dataCasamento = response.informacoesPessoais.casamento.dataCasamento ? formatDateShort(response.informacoesPessoais.casamento.dataCasamento) : null;
                            response.exclusao = response.exclusao ? response.exclusao : {data: null, motivo: ''}
                            response.falecimento = response.falecimento ? response.falecimento : {
                                data: null,
                                motivo: '',
                                local: ''
                            }
                            response.ingresso = response.ingresso ? response.ingresso : {
                                data: null,
                                local: '',
                                forma: ''
                            }
                            response.transferencia = response.transferencia ? response.transferencia : {
                                data: null,
                                motivo: '',
                                local: ''
                            }
                            response.visitas = response.visitas ? response.visitas : {motivo: ''}

                            console.log('membro: ', response);
                            setMember(response);
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
        getAllInvites();
    }, [member]);

    return (
        <div className="container mx-auto py-4 px-4 sm:py-10 sm:px-6">
            {
                member && member.email ? (
                    <Card className="w-full max-w-4xl mx-auto">
                        <CardHeader
                            className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
                            <div className="flex flex-wrap items-start justify-start sm:justify-start gap-2 flex-col">
                                {renderStatusBadge(member.status)}
                                <span>Nível de acesso: <Badge variant="outline">{member.role}</Badge></span>
                            </div>

                            <Separator/>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Informações Básicas</p>
                                    <div className="flex items-center"><Mail className="mr-2 h-4 w-4"/> {member.email}
                                    </div>
                                    <div className="flex items-center"><Phone
                                        className="mr-2 h-4 w-4"/> {member.telefone}</div>
                                    <div className="flex items-center"><Calendar
                                        className="mr-2 h-4 w-4"/> Nascimento: {format(member.dataNascimento, 'dd/MM/yyyy')}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Documentos</p>
                                    <div>CPF: {member.cpf}</div>
                                    <div>RG: {member.rg}</div>
                                </div>
                            </div>

                            <Separator/>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Informações Pessoais</p>
                                <div>Estado Civil: {member.informacoesPessoais.estadoCivil}</div>
                                {member.informacoesPessoais.casamento.conjugue && (
                                    <div className="flex flex-wrap items-center">
                                        <Heart className="mr-2 h-4 w-4"/>
                                        <span>Cônjuge: {member.informacoesPessoais.casamento.conjugue.nome}</span>
                                        {member.informacoesPessoais.casamento.dataCasamento && (
                                            <span className="ml-2">
                                                (Casamento: {format(member.informacoesPessoais.casamento.dataCasamento, 'dd/MM/yyyy')})
                                            </span>
                                        )}
                                    </div>
                                )}
                                {member.informacoesPessoais.temFilhos && (
                                    <div className="flex items-start">
                                        <Users className="mr-2 h-4 w-4 mt-1"/>
                                        <div>
                                            Filhos: {member.informacoesPessoais.filhos.map(filho => filho.nome).join(', ')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator/>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Cargo e Ministério</p>
                                <div className="flex items-center">
                                    <Briefcase className="mr-2 h-4 w-4"/> Diácono: {member.diacono.nome}
                                </div>
                                <div className="flex items-start">
                                    <Users className="mr-2 h-4 w-4 mt-1"/>
                                    <div>
                                        Ministérios: {mapMinisterios(member).join(', ')}
                                    </div>
                                </div>
                            </div>

                            <Separator/>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                                {member.endereco && (
                                    <div className="flex items-start">
                                        <MapPin className="mr-2 h-4 w-4 mt-1"/>
                                        <div>
                                            {member.endereco.rua}, {member.endereco.numero}
                                            {member.endereco.complemento && `, ${member.endereco.complemento}`}<br/>
                                            {member.endereco.bairro ? member.endereco.bairro + ',' : ''} {member.endereco.cidade} - {member.endereco.estado}<br/>
                                            {member.endereco.cep}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator/>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Histórico</p>
                                {member.ingresso.data && (
                                    <div className="flex items-start">
                                        <LogIn className="mr-2 h-4 w-4 mt-1"/>
                                        <div>
                                            Ingresso: {format(member.ingresso.data, 'dd/MM/yyyy')} - {member.ingresso.forma} ({member.ingresso.local})
                                        </div>
                                    </div>
                                )}
                                {member.transferencia.data && (
                                    <div className="flex items-start">
                                        <LogOut className="mr-2 h-4 w-4 mt-1"/>
                                        <div>
                                            Transferência: {format(member.transferencia.data, 'dd/MM/yyyy')} - {member.transferencia.motivo} ({member.transferencia.local})
                                        </div>
                                    </div>
                                )}
                                {member.falecimento.data && (
                                    <div className="flex items-start">
                                        <Skull className="mr-2 h-4 w-4 mt-1"/>
                                        <div>
                                            Falecimento: {format(member.falecimento.data, 'dd/MM/yyyy')} - {member.falecimento.motivo} ({member.falecimento.local})
                                        </div>
                                    </div>
                                )}
                                {member.exclusao.data && (
                                    <div className="flex items-start">
                                        <Ban className="mr-2 h-4 w-4 mt-1"/>
                                        <div>
                                            Exclusão: {format(member.exclusao.data, 'dd/MM/yyyy')} - {member.exclusao.motivo}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </CardContent>
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
                                                        <span>{invitation.to}</span>
                                                    </div>
                                                    <div
                                                        className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        {format(invitation.createdAt, 'dd/MM/yyyy')}
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
                    </Card>
                ) : (
                    <p>Membro não encontrado.</p>
                )
            }
        </div>
    )
}

