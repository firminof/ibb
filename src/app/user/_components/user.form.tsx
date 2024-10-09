"use client"

import * as React from "react"
import {useEffect, useState} from "react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {BookOpenIcon, CalendarIcon, HeartIcon, MailIcon, MessageSquareText, PhoneIcon, UserIcon} from "lucide-react"
import {Separator} from "@/components/ui/separator"
import {IMinistries, IUserResponseApi} from "@/lib/models/user-response-api";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ReloadIcon} from "@radix-ui/react-icons";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {SendIcon} from "@/components/send-icon/send-icon";
import {UserApi} from "@/lib/api/user-api";
import {Backdrop, CircularProgress} from "@mui/material";
import {ToastError} from "@/components/toast/toast-error";
import {getContextAuth} from "@/lib/helpers/helpers";

export function UserForm({memberParam}: IUserResponseApi) {
    const [openDialogSendMessage, setOpenDialogSendMessage] = useState(false);
    const [messageWhatsApp, setMessageWhatsApp] = useState<string>('');
    const [member, setMember] = useState<IUserResponseApi | null>(null);

    const [openBackLoadingMembros, setOpenBackLoadingMembros] = useState(false);
    const [showBackLoadingMessage, setShowBackLoadingMessage] = useState<string>('');

    const [showErrorApi, setShowErrorApi] = useState(false);
    const [showErrorMessageApi, setShowErrorMessageApi] = useState<string>('');

    const contextAuth = getContextAuth();

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'ativo':
                return 'bg-green-500';
            case 'excluido':
            case 'inativo':
                return 'bg-red-500';
            case 'transferido':
                return 'bg-blue-500';
            case 'falecido':
                return 'bg-gray-500';
            case 'visitante':
                return 'bg-yellow-500';
            case 'congregado':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    }

    const InfoItem = ({icon, label, value}: { icon: React.ReactNode, label: string, value: string }) => (
        <div className="flex items-center space-x-2">
            {icon}
            <span className="font-semibold">{label}:</span>
            <span>{value}</span>
        </div>
    )

    const InfoItemMinisterios = ({icon, label, value}: {
        icon: React.ReactNode,
        label: string,
        value: IMinistries[]
    }) => (
        <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2">
                {icon}
                <span className="font-semibold">{label}:</span>
            </div>

            {
                value.map((ministerio: IMinistries, index: number) => {
                    if (ministerio) {
                        return (
                            <div key={index.toString()}>
                                - {ministerio.nome}
                            </div>
                        )
                    }

                    return (
                        <div
                            key={index.toString()}
                            className="py-1 text-yellow-700 font-semibold">-
                        </div>
                    )
                })
            }
        </div>
    )

    const handleSendMessageWhatsapp = (e) => {
        e.preventDefault();

        console.log('Enviar mensagem pro whatsapp');
    }

    const getMember = () => {
        if (contextAuth.mongoId !== '') {
            UserApi.fetchMemberById(contextAuth.mongoId)
                .then(({data}: IUserResponseApi) => {
                    setMember(data);
                })
                .catch(() => {
                    console.log('Erro ao buscar por membro!')
                })
                .finally(() => {
                    setOpenBackLoadingMembros(false);
                    setShowBackLoadingMessage('');
                })
        }
    }

    useEffect(() => {
        console.log('contextAuth: ', contextAuth);
        if (!memberParam && contextAuth) {
            getMember();
        }
        setMember(null);
        console.log('memberParam? ', memberParam);
        setMember(memberParam);
    }, []);

    const handleReloadUser = () => {
        const userStorage = JSON.parse(sessionStorage.getItem('user'));

        UserApi.getUserByEmail(userStorage['user']['email'])
            .then((result) => {
                if (result) {
                    UserApi.fetchMemberById(result.customClaims.mongoId)
                        .then(({data}: IUserResponseApi) => {
                            setMember(data);
                        })
                        .catch(() => {
                            console.log('Erro ao buscar por membro!')
                        })
                        .finally(() => {
                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                        })
                }
            })
            .catch((error) => {
                console.log('Erro ao recuperar os dados do membro!');
            })
    }

    return (
        <div className="mt-6 container mx-auto">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoadingMembros}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    <p>{showBackLoadingMessage}</p>
                </div>
            </Backdrop>

            {
                showErrorApi && (
                    <ToastError data={{message: showErrorMessageApi}} visible={true}
                                setShowParentComponent={setShowErrorApi}/>
                )
            }

            <Dialog open={openDialogSendMessage} onOpenChange={setOpenDialogSendMessage}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enviar mensagem via WhatsApp</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="mensagem-whatsapp">Sua mensagem</Label>
                            <Textarea placeholder="Escreva sua mensagem aqui."
                                      id="mensagem-whatsapp"
                                      value={messageWhatsApp}
                                      onChange={(e) => setMessageWhatsApp(e.target.value)}/>
                            <p className="text-sm text-muted-foreground">
                                Preencha a mensagem com pelo menos 20 caracteres: {messageWhatsApp.length}
                            </p>
                        </div>

                        <div className="flex justify-end items-center space-y-2">
                            <Button type="submit" size="sm" className="px-3" disabled={messageWhatsApp.length < 20}
                                    onClick={(e) => handleSendMessageWhatsapp(e)}>
                                <SendIcon className="w-4 h-4 mr-2"/>
                                Enviar
                            </Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>

            {
                member ? (
                        <div
                            className="flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-colors duration-200">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">

                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={member.foto || "/placeholder.svg?height=96&width=96"}
                                                     alt={member.nome}/>
                                        <AvatarFallback>{member.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h2 className="text-2xl font-bold">{member.nome}</h2>
                                        <div>
                                            <div className="mt-2">
                                                <InfoItem icon={<CalendarIcon className="w-4 h-4"/>} label="MEMBRO DESDE"
                                                          value={member.data_ingresso || 'Não informado'}/>
                                            </div>

                                            <div className="flex items-center mt-3 space-x-2">
                                                <Badge variant="outline"
                                                       className={`${getStatusColor(member.status)} text-white`}>
                                                    {member.status.toUpperCase()}
                                                </Badge>
                                                <Badge variant="secondary">{member.role}</Badge>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <Button
                                                className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                onClick={() => console.log('abrir o whatsapp')}
                                            >
                                                <MessageSquareText className="w-4 h-4"/>
                                                Pedir oração
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                                        <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="CPF" value={member.cpf}/>
                                        <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="RG" value={member.rg}/>
                                        <InfoItem icon={<CalendarIcon className="w-4 h-4"/>} label="Data de Nascimento"
                                                  value={member.data_nascimento}/>
                                        <InfoItem icon={<HeartIcon className="w-4 h-4"/>} label="Estado Civil"
                                                  value={member.estado_civil}/>
                                        <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="Possui Filhos"
                                                  value={member.possui_filhos ? 'Sim' : 'Não'}/>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Contato</h3>
                                        <InfoItem icon={<PhoneIcon className="w-4 h-4"/>} label="Telefone"
                                                  value={member.telefone}/>
                                        <InfoItem icon={<MailIcon className="w-4 h-4"/>} label="Email"
                                                  value={member.email}/>
                                    </div>
                                </div>
                                <Separator/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Informações da Igreja</h3>
                                        <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="Forma de Ingresso"
                                                  value={member.forma_ingresso || 'Não informado'}/>
                                        <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="Local de Ingresso"
                                                  value={member.local_ingresso || 'Não informado'}/>

                                        <InfoItemMinisterios
                                            icon={<BookOpenIcon className="w-4 h-4"/>}
                                            label="Ministérios"
                                            value={member.ministerio}
                                        />

                                        <Separator/>
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Diácono/Diaconisa</h3>
                                            <div className="flex flex-col justify-items-start gap-4">
                                                <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="Nome"
                                                          value={member.diacono.nome}/>
                                                <Button
                                                    className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                    onClick={() => {
                                                        setOpenDialogSendMessage(true);
                                                    }}
                                                >
                                                    <PhoneIcon className="w-4 h-4"/>
                                                    Enviar Mensagem
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-yellow-500">Informações de
                                                Transferência</h3>
                                            <InfoItem icon={<CalendarIcon className="w-4 h-4"/>}
                                                      label="Data de Transferência"
                                                      value={member.transferencia || 'Não informado'}/>
                                            <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="Motivo"
                                                      value={member.motivo_transferencia || 'Não informado'}/>
                                        </div>

                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-red-500">Informações de Exclusão</h3>
                                            <InfoItem icon={<CalendarIcon className="w-4 h-4"/>} label="Data de Exclusão"
                                                      value={member.excluido || 'Não informado'}/>
                                            <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="Motivo"
                                                      value={member.motivo_exclusao || 'Não informado'}/>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-gray-500">Informações de
                                                Falecimento</h3>
                                            <InfoItem icon={<CalendarIcon className="w-4 h-4"/>} label="Data de Falecimento"
                                                      value={member.falecimento || 'Não informado'}/>
                                            <InfoItem icon={<UserIcon className="w-4 h-4"/>} label="Motivo"
                                                      value={member.motivo_falecimento || 'Não informado'}/>
                                        </div>
                                    </div>

                                </div>
                                <div className="text-sm text-muted-foreground pb-4">
                                    <CalendarIcon className="inline w-4 h-4 mr-1"/>
                                    Última atualização: {member.updatedAt}
                                </div>
                            </div>
                        </div>
                    ) :
                    (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-end items-center -mt-6 -mr-6">
                                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex bg-zinc-500"
                                            onClick={() => handleReloadUser()}>
                                        <ReloadIcon className="w-4 h-4 mr-1"/>
                                        Recarregar
                                    </Button>
                                </div>
                            </CardHeader>

                            <div className="flex justify-center">
                                <CardContent>
                                    <CardTitle>Usuário indisponível, clique no botão Recarregar ao lado para tentar
                                        novamente</CardTitle>
                                </CardContent>
                            </div>
                        </Card>
                    )
            }
        </div>
    )
}