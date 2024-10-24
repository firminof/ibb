"use client"

import {IMinisteriosSelect, IMisterios} from "@/lib/models/misterios";
import {ministerios} from "@/lib/constants/misterios";
import {IDiaconoSelect} from "@/lib/models/diaconos";
import {diaconos} from "@/lib/constants/diaconos";
import {ITempUserUpdate, IUser, StatusEnum, UserRoles} from "@/lib/models/user";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {PhoneIcon} from "@/components/phone-icon/phone-icon";
import {ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon, Pencil1Icon, ReloadIcon} from "@radix-ui/react-icons";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import * as React from "react";
import {useEffect, useState} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {UserApi} from "@/lib/api/user-api";
import {IMinistries, IUserResponseApi} from "@/lib/models/user-response-api";
import {ToastError} from "@/components/toast/toast-error";
import {Backdrop, CircularProgress} from "@mui/material";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {ToastSuccess} from "@/components/toast/toast-success";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {DeleteIcon, EditIcon, EyeIcon} from "lucide-react";
import {UserForm} from "@/app/user/_components/user.form";
import {Checkbox} from "@/components/ui/checkbox";
import {Textarea} from "@/components/ui/textarea";
import {SendIcon} from "@/components/send-icon/send-icon";
import {getContextAuth} from "@/lib/helpers/helpers";

export function MembersList() {
    const [showErrorApi, setShowErrorApi] = useState(false);
    const [showErrorMessageApi, setShowErrorMessageApi] = useState<string>('');

    const [isSuccess, setIsSuccess] = useState(false);
    const [showSuccessMessageApi, setShowSucessMessageApi] = useState<string>('');

    const [openBackLoadingMembros, setOpenBackLoadingMembros] = useState(false);
    const [showBackLoadingMessage, setShowBackLoadingMessage] = useState<string>('');

    const router = useRouter();

    const [isOpenFilter, setIsOpenFilter] = useState(false);

    const [ministries, setMinistries] = useState<IMinistries[]>([]);

    const [members, setMembers] = useState<IUserResponseApi[]>([]);
    const [membersToFilter, setMembersToFilter] = useState<IUserResponseApi[]>([]);
    const [memberSelected, setMemberSelected] = useState<IUserResponseApi>({} as IUserResponseApi);
    const [memberSelectedCheckbox, setMemberSelectedCheckbox] = useState<string[]>([]);
    const [messageWhatsApp, setMessageWhatsApp] = useState<string>('');

    const [openDialogStatus, setOpenDialogStatus] = useState(false);
    const [openDialogSendMessage, setOpenDialogSendMessage] = useState(false);
    const [isOpenMemberDetail, setIsOpenMemberDetail] = useState(false)

    const [mudarStatusIdMembro, setMudarStatusIdMembro] = useState<string>('');
    const [mudarStatus, setMudarStatus] = useState('');

    const [mudarMotivo, setMudarMotivo] = useState<string>('');
    const [mudarData, setMudarData] = useState<Date>(new Date());

    // Gerencia o estado para controlar se o botão deve ser exibido ou não
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredMembers, setHoveredMembers] = useState<IUserResponseApi>({} as IUserResponseApi);

    const [nome, setNome] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [diacono, setDiacono] = useState<string>('');
    const [ministerio, setMinisterio] = useState<number[]>([]);
    const [idade, setIdade] = useState<string>('');
    const [updatedAt, setUpdatedAt] = useState<string>('');
    const [filterPreviousModified, setFilterPreviousModified] = useState(false);

    const contextAuth = getContextAuth();
    if (contextAuth.role === UserRoles.MEMBRO) {
        router.push('/user');
    }

    const ministeriosCadastrados: IMinisteriosSelect[] = ministerios.map((ministerio: IMisterios): IMinisteriosSelect => ({
        id: ministerio.id,
        label: ministerio.nome
    }));

    const diaconosCadastrados: IDiaconoSelect[] = diaconos.map((diacono: IUser): IDiaconoSelect => ({
        id: diacono.id,
        label: diacono.nome,
        value: diacono.nome
    }));

    const ministeriosSelected = (ministerios: any) => {
        setMinisterio((previous: number[]) => {
            return ({...ministerios});
        });

        filtros('ministerio', ministerios, null);
    }

    const getAllMinistries = () => {
        setOpenBackLoadingMembros(true);
        setShowBackLoadingMessage('Buscando pelos ministérios...');

        try {
            UserApi.fetchMinistries()
                .then((response: IMinistries[]) => {
                    if (response && response.length > 0) {
                        setMinistries(response);
                    } else {
                        setMinistries([]);
                        setOpenBackLoadingMembros(false);
                        setShowBackLoadingMessage('');
                    }
                })
                .catch((error) => {
                    console.log(error);
                    setMinistries([]);
                    setOpenBackLoadingMembros(false);
                    setShowBackLoadingMessage('');

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setShowErrorMessageApi('Falha na requisição, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                            setMinistries([]);
                            break;
                        case 'ERR_NETWORK':
                            setShowErrorMessageApi('Erro na conexão, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                            setMinistries([]);
                            break;

                        default:
                            setShowErrorMessageApi('Erro genérico do servidor, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                            setMinistries([]);
                            break;
                    }
                });
        } catch (e) {
            setShowErrorMessageApi('Erro desconhecido, tente novamente!');
            setShowErrorApi(true);

            setOpenBackLoadingMembros(false);
            setShowBackLoadingMessage('');
            setMinistries([]);
        }
    }

    const getAllMembers = async (): Promise<void> => {
        setOpenBackLoadingMembros(true);
        setShowBackLoadingMessage('Carregando membros...');

        try {
            UserApi.fetchMembers()
                .then((response) => {
                    if (response.data.length > 0) {
                        // Mapeando ministérios para todos os membros
                        const mappedMembers: IUserResponseApi[] = response.data.map((member: any) => {
                            return {
                                ...member,
                                ministerio: member.ministerio.map((ministerioId: any) => {
                                    return ministries.find((ministerio: IMinistries) => ministerio._id === ministerioId.toString()) || null;
                                })
                            };
                        });
                        setMembers(mappedMembers);
                        setMembersToFilter(mappedMembers);

                        setOpenBackLoadingMembros(false);
                        setShowBackLoadingMessage('');
                        return;
                    }

                    setMembers([]);
                    setMembersToFilter([]);
                    setOpenBackLoadingMembros(false);
                    setShowBackLoadingMessage('');
                })
                .catch((error: any) => {
                    console.log(error);
                    setMembers([]);
                    setMembersToFilter([]);
                    setOpenBackLoadingMembros(false);
                    setShowBackLoadingMessage('');

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setShowErrorMessageApi('Falha na requisição, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                            setMembers([]);
                            break;
                        case 'ERR_NETWORK':
                            setShowErrorMessageApi('Erro na conexão, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                            setMembers([]);
                            break;

                        default:
                            setShowErrorMessageApi('Erro genérico do servidor, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                            setMembers([]);
                            break;
                    }
                });
        } catch (e) {
            setShowErrorMessageApi('Erro desconhecido, tente novamente!');
            setShowErrorApi(true);

            setOpenBackLoadingMembros(false);
            setShowBackLoadingMessage('');
            setMembers([]);
        }
    }

    const fetchMembers = () => {
        getAllMinistries();

        if (ministries && ministries.length > 0 && members.length === 0) {
            getAllMembers();
        }
    }

    useEffect(() => {
        if (ministries.length === 0) {
            getAllMinistries();
        }
    }, []);

    useEffect(() => {
        if (ministries && ministries.length > 0 && members.length === 0) {
            getAllMembers();
        }
    }, [ministries]);

    const filtros = (chave: string, valor: any, event: any) => {
        if (event) {
            event.preventDefault();
        }

        switch (chave) {
            case 'nome':
                const result: IUserResponseApi[] = membersToFilter.filter((member: IUserResponseApi) => (
                    member.nome.toLowerCase().includes(valor.toLowerCase())
                ))
                setNome(valor);
                setMembers(result);
                break;
            case 'status':
                const resultStatus: IUserResponseApi[] = membersToFilter.filter((member: IUserResponseApi) => (
                    member.status.toLowerCase() === valor.toLowerCase()
                ))
                setStatus(valor);
                setMembers(resultStatus);
                break;
            case 'ministerio':
                if (valor.length > 0) {
                    const resultMinisterio: IUserResponseApi[] = membersToFilter.filter((member: IUserResponseApi) => {
                        if (member && member.ministerio.length > 0) {
                            const filterMemberByMinisterio: IMinistries[] = member.ministerio.filter((a: IMinistries) => valor.includes(a.nome));
                            if (filterMemberByMinisterio.length > 0) return member;
                        }
                    })
                    setMembers(resultMinisterio);
                    setFilterPreviousModified(true);
                }

                if (filterPreviousModified && valor.length === 0) {
                    setMembers(membersToFilter);
                }
                break;
            case 'diacono':
                const resultDiacono: IUserResponseApi[] = membersToFilter.filter((member: IUserResponseApi) => (
                    member.diacono.nome.toLowerCase().includes(valor.toLowerCase())
                ))
                setDiacono(valor);
                setMembers(resultDiacono);
                break;
            case 'idade':
                const resultIdade: IUserResponseApi[] = membersToFilter.filter((member: IUserResponseApi) => {
                    switch (valor as any) {
                        case 'infantil':
                            if (member.idade >= 0 && member.idade < 12) {
                                return member;
                            }
                            break;
                        case 'adolescente':
                            if (member.idade >= 17 && member.idade < 17) {
                                return member;
                            }
                            break;
                        case 'adulto':
                            if (member.idade >= 17 && member.idade < 64) {
                                return member;
                            }
                            break;
                        case 'idoso':
                            if (member.idade >= 64) {
                                return member;
                            }
                            break;
                    }
                })
                setIdade(valor);
                setMembers(resultIdade);
                break;
            case 'updatedAt':
                // Obter o timestamp atual (em milissegundos)
                const agora = Date.now();

                // Calcular o timestamp da data limite com base nos dias
                const dataLimiteTimestamp = agora - (valor * 24 * 60 * 60 * 1000);

                // Filtrar a lista de membros
                const resultUpdated: IUserResponseApi[] = membersToFilter.filter((member: IUserResponseApi) => {
                    const updatedAtToISO: string[] = member.updatedAt.split(' ')[0].split('/');
                    const updatedAtToDate: string = `${updatedAtToISO[2]}-${updatedAtToISO[1]}-${updatedAtToISO[0]}T${member.updatedAt.split(' ')[1]}`
                    const updatedAtTimestamp: number = new Date(updatedAtToDate).getTime();
                    if (updatedAtTimestamp >= dataLimiteTimestamp) return member;
                });
                setUpdatedAt(valor);
                setMembers(resultUpdated);
                break;
        }
    }

    const limparFiltros = () => {
        setNome('');
        setStatus('');
        setDiacono('');
        setIdade('');
        setUpdatedAt('');

        setMembers(membersToFilter);
        setMinisterio([]);
    }

    const handleMudarStatus = (e: any) => {
        e.preventDefault();

        setOpenBackLoadingMembros(true);
        setShowBackLoadingMessage('Atualizando status de membresia...');

        const body: ITempUserUpdate = {
            status: mudarStatus as StatusEnum
        };

        switch (body.status as any) {
            case StatusEnum.transferido:
                body.transferencia = new Date(mudarData);
                body.motivo_transferencia = mudarMotivo;
                break;
            case StatusEnum.falecido:
                body.falecimento = new Date(mudarData);
                body.motivo_falecimento = mudarMotivo;
                break;
            case StatusEnum.excluido:
                body.excluido = new Date(mudarData);
                body.motivo_exclusao = mudarMotivo;
                break;
        }

        UserApi.updateMember(mudarStatusIdMembro, body)
            .then(() => {
                getAllMembers();

                setIsSuccess(true);
                setShowSucessMessageApi('Sucesso ao atualizar o status!');

                setShowErrorApi(false);
                setShowErrorMessageApi('')
            })
            .catch(() => {
                setIsSuccess(false);
                setShowSucessMessageApi('');

                setShowErrorApi(true);
                setShowErrorMessageApi('Erro ao atualizar o status, tente novamente!');
            })
            .finally(() => {
                setOpenBackLoadingMembros(false);
                setShowBackLoadingMessage('');
                setOpenDialogStatus(false);
            })
    }

    const changeStatusMudar = (value: string) => {
        switch (value as any) {
            case StatusEnum.visitante:
                setMudarStatus(StatusEnum.visitante);
                break;
            case StatusEnum.congregado:
                setMudarStatus(StatusEnum.congregado);
                break;
            case StatusEnum.ativo:
                setMudarStatus(StatusEnum.ativo);
                break;
            case StatusEnum.inativo:
                setMudarStatus(StatusEnum.inativo);
                break;
            case StatusEnum.transferido:
                setMudarStatus(StatusEnum.transferido);
                break;
            case StatusEnum.falecido:
                setMudarStatus(StatusEnum.falecido);
                break;
            case StatusEnum.excluido:
                setMudarStatus(StatusEnum.excluido);
                break;
        }
    }

    const handleSendMessageWhatsapp = (e: any) => {
        e.preventDefault();

        console.log('Enviar mensagem pro whatsapp');
    }

    const handleRequestRegistrationUpdate = (e: any) => {
        setOpenBackLoadingMembros(true);
        setShowBackLoadingMessage('Solicitando atualização cadastral...');

        UserApi.updateInfo(memberSelectedCheckbox)
            .then(() => {
                setIsSuccess(true);
                setShowSucessMessageApi('Sucesso ao solicitar atualização cadastral em massa!');
            })
            .catch(() => {
                setShowErrorApi(true);
                setShowErrorMessageApi('Erro ao solicitar atualização cadastral em massa!');
            })
            .finally(() => {
                setOpenBackLoadingMembros(false);
                setShowBackLoadingMessage('');
                setMemberSelectedCheckbox([]);
            })
    }

    const handleDeleteMembers = (e: any) => {
        setOpenBackLoadingMembros(true);
        setShowBackLoadingMessage(`${memberSelectedCheckbox.length === 1 ? 'Excluindo membro' : 'Excluindo membros'}`);

        Promise.all(
            memberSelectedCheckbox.map((member: string) => {
                return UserApi.deleteMember(member);
            })
        )
            .then(() => {
                setIsSuccess(true);
                setShowSucessMessageApi(`${memberSelectedCheckbox.length === 1 ? 'Sucesso ao excluir o membro!' : 'Sucesso ao excluir os membros!'}`);
            })
            .catch(() => {
                setShowErrorApi(true);
                setShowErrorMessageApi(`${memberSelectedCheckbox.length === 1 ? 'Erro ao excluir o membro!' : 'Sucesso ao excluir os membros!'}`);
            })
            .finally(() => {
                setOpenBackLoadingMembros(false);
                setShowBackLoadingMessage('');
                getAllMembers();
                setMemberSelectedCheckbox([]);
            });
    }

    return (
        <div className="mt-4 container mx-auto">
            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>

                <div className="flex justify-between items-center">
                    <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Membros</h2>
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                            onClick={() => router.push('/create-user')}>
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        Adicionar Membro
                    </Button>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <div className="flex justify-end items-center -mt-6 -mr-6 gap-4">
                        {
                            memberSelectedCheckbox && memberSelectedCheckbox.length > 0 && (
                                <>
                                    <Button size="sm"
                                            className="font-bold sm:inline-flex md:inline-flex bg-red-600 hover:bg-red-700"
                                            onClick={(e) => handleDeleteMembers(e)}>
                                        <DeleteIcon className="w-4 h-4 mr-1"/>
                                        {
                                            memberSelectedCheckbox.length > 1 ? 'Excluir membros' : 'Excluir membro'
                                        }
                                    </Button>

                                    <Button size="sm"
                                            className="font-bold sm:inline-flex md:inline-flex bg-yellow-600 hover:bg-yellow-700"
                                            onClick={(e) => handleRequestRegistrationUpdate(e)}>
                                        <EditIcon className="w-4 h-4 mr-1"/>
                                        Solicitar atualização cadastral
                                    </Button>
                                </>
                            )
                        }

                        <Button size="sm" className="font-bold sm:inline-flex md:inline-flex bg-zinc-500"
                                onClick={() => {
                                    setOpenBackLoadingMembros(true);
                                    setShowBackLoadingMessage('Carregando membros');

                                    setMembers([]);
                                    setMembersToFilter([]);

                                    setMemberSelected({} as IUserResponseApi);

                                    setMemberSelectedCheckbox([]);

                                    setTimeout(() => fetchMembers(), 500);
                                }}>
                            <ReloadIcon className="w-4 h-4 mr-1"/>
                            Recarregar
                        </Button>
                    </div>
                    <Collapsible
                        open={isOpenFilter}
                        onOpenChange={setIsOpenFilter}
                        className="w-full space-y-2"
                    >
                        <div className="flex items-center justify-between space-x-4">
                            <h4 className="text-black text-xl font-normal">
                                Filtros
                            </h4>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                    {
                                        isOpenFilter ? <ChevronUpIcon className="h-4 w-4"/> :
                                            <ChevronDownIcon className="h-4 w-4"/>
                                    }
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-2">
                            <div className="mb-4 gap-4 grid sm:grid-cols-1 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name-filter">Filtrar por nome</Label>
                                    <Input
                                        id="name-filter"
                                        className="mt-2"
                                        value={nome}
                                        onChange={(e) => filtros('nome', e.target.value, e)}
                                        placeholder="Digite o nome..."/>
                                </div>

                                <div className="space-y-2">
                                    <Label>Filtrar por Status</Label>
                                    <Select onValueChange={(value: string) => filtros('status', value, null)} value={status}>
                                        <SelectTrigger id="status-filter" aria-label="Status"
                                                       className="mt-2 sm:mt-2">
                                            <SelectValue placeholder="Selecionar status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="visitante">Visitante</SelectItem>
                                            <SelectItem value="congregado">Congregado</SelectItem>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="transferido">Transferido</SelectItem>
                                            <SelectItem value="falecido">Falecido</SelectItem>
                                            <SelectItem value="excluido">Excluído</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 flex-1 z-30">
                                    <Label htmlFor="ministerio-filter">Filtrar por Ministério(s)</Label>
                                    <MultiSelectDropdown
                                        id="ministerio-filter"
                                        dataSelected={ministeriosSelected}
                                        data={ministeriosCadastrados}/>
                                </div>

                                <div className="space-y-2">
                                    <Label>Filtrar por Diácono</Label>
                                    <Select
                                            value={diacono}
                                            onValueChange={(value: string) => filtros('diacono', value, null)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                diaconosCadastrados && diaconosCadastrados.length > 0 && (
                                                    diaconosCadastrados.map((diacono: IDiaconoSelect) => (
                                                        <SelectItem key={diacono.id}
                                                                    value={diacono.value}>
                                                            {diacono.label}
                                                        </SelectItem>
                                                    ))
                                                )
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="md:ml-4">Filtrar por Faixa Etária</Label>
                                    <Select
                                        value={idade}
                                        onValueChange={(value: string) => filtros('idade', value, null)}>
                                        <SelectTrigger id="age-range-filter" aria-label="Status"
                                                       className="mt-2 sm:mt-2">
                                            <SelectValue placeholder="Selecionar faixa etária"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="infantil">Infantil (0-12 anos)</SelectItem>
                                            <SelectItem value="adolescente">Adolescente (13-17
                                                anos)</SelectItem>
                                            <SelectItem value="adulto">Adulto (18-64 anos)</SelectItem>
                                            <SelectItem value="idoso">Idoso (65+ anos)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="md:ml-4">Filtrar por período de tempo</Label>
                                    <Select
                                        value={updatedAt}
                                        onValueChange={(value: string) => filtros('updatedAt', value, null)}>
                                        <SelectTrigger id="period-time-filter" aria-label="Período de tempo"
                                                       className="mt-2 sm:mt-2">
                                            <SelectValue placeholder="Selecionar período"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">Últimos 30 dias</SelectItem>
                                            <SelectItem value="60">Últimos 60 dias</SelectItem>
                                            <SelectItem value="90">Últimos 90 dias</SelectItem>
                                            <SelectItem value="180">Últimos 180 dias</SelectItem>
                                            <SelectItem value="365">Últimos 365 dias</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => limparFiltros()}>Limpar filtros</Button>
                        </CollapsibleContent>
                    </Collapsible>

                </CardHeader>
                <CardContent>
                    {
                        members && members.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold"></TableHead>
                                        <TableHead className="font-semibold">Nome</TableHead>
                                        <TableHead className="font-semibold">Aniversário</TableHead>
                                        <TableHead className="font-semibold">Diácono/Diaconisa</TableHead>
                                        <TableHead className="font-semibold">Idade</TableHead>
                                        <TableHead className="font-semibold">Ministério(s)</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Última atualização</TableHead>
                                        <TableHead className="font-semibold">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        members.map((membro: IUserResponseApi, index: number) => (
                                            <TableRow
                                                key={membro._id}
                                                onMouseEnter={() => {
                                                    setHoveredRow(index);
                                                    setHoveredMembers(membro);
                                                }}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                className="hover:bg-gray-100 transition"
                                            >
                                                <TableCell>
                                                    <Checkbox id="member-checkbox" onClick={() => {
                                                        setMemberSelectedCheckbox((previous: string[]) => {
                                                            if (previous.includes(membro._id)) {
                                                                // Se o item já estiver selecionado, removemos ele do array
                                                                return previous.filter((id) => id !== membro._id);
                                                            } else {
                                                                // Se o item não estiver selecionado, adicionamos ele ao array
                                                                return [...previous, membro._id];
                                                            }
                                                        })
                                                    }}/>
                                                </TableCell>
                                                <TableCell>{membro.nome}</TableCell>
                                                <TableCell>{membro.data_nascimento}</TableCell>
                                                <TableCell>{membro.diacono.nome ? membro.diacono.nome : (
                                                    <div
                                                        className="py-1 text-yellow-700 font-semibold">Nenhum
                                                        diácono/diaconisa cadastrado
                                                    </div>
                                                )}</TableCell>
                                                <TableCell>{membro.idade}</TableCell>
                                                <TableCell>
                                                    {
                                                        membro.ministerio.map((ministerio: IMinistries, index: number) => {
                                                            if (ministerio) {
                                                                return (
                                                                    <div key={index}>
                                                                        {ministerio.nome}
                                                                    </div>
                                                                )
                                                            }

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="py-1 text-yellow-700 font-semibold">-
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        hoveredRow === index ? (
                                                            <Button
                                                                className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-700 text-primary-foreground hover:bg-gray-700/90 focus:outline-none focus:ring-1 focus:ring-gray/50"
                                                                onClick={() => {
                                                                    setMudarStatusIdMembro(membro._id);
                                                                    setOpenDialogStatus(true);
                                                                    changeStatusMudar(membro.status);
                                                                }}
                                                            >
                                                                Alterar status
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                {
                                                                    membro.status === 'ativo' ? (
                                                                        <div
                                                                            className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Ativo</div>
                                                                    ) : membro.status === 'inativo' ? (
                                                                        <div
                                                                            className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Inativo</div>
                                                                    ) : membro.status === 'transferido' ? (
                                                                        <div
                                                                            className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">Transferido</div>
                                                                    ) : membro.status === 'falecido' ? (
                                                                        <div
                                                                            className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">Falecido</div>
                                                                    ) : membro.status === 'excluido' ? (
                                                                        <div
                                                                            className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Excluído</div>
                                                                    ) : membro.status === 'visitante' ? (
                                                                        <div
                                                                            className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Visitante</div>
                                                                    ) : membro.status === 'congregado' ? (
                                                                        <div
                                                                            className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">Congregado</div>
                                                                    ) : (
                                                                        membro.status
                                                                    )
                                                                }
                                                            </>
                                                        )
                                                    }
                                                </TableCell>
                                                <TableCell>{membro.updatedAt}</TableCell>
                                                <TableCell className="inline-flex items-center gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" onClick={() => {
                                                                    setMemberSelected(membro);
                                                                    setIsOpenMemberDetail(true);
                                                                }}>
                                                                    <EyeIcon/>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Visualizar membro</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" onClick={() => {
                                                                    router.push(`/edit-user?id=${membro._id}`)
                                                                }}>
                                                                    <Pencil1Icon/>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Editar membro</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    {/*<Button*/}
                                                    {/*    className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/50"*/}
                                                    {/*    onClick={() => {*/}
                                                    {/*        setMemberSelected(membro);*/}
                                                    {/*        setOpenDialogSendMessage(true);*/}
                                                    {/*    }}*/}
                                                    {/*>*/}
                                                    {/*    <PhoneIcon className="w-4 h-4"/>*/}
                                                    {/*    Enviar Mensagem*/}
                                                    {/*</Button>*/}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex justify-center">
                                <CardHeader>
                                    <CardTitle>Lista de membros vazia!</CardTitle>
                                </CardHeader>
                            </div>
                        )
                    }
                </CardContent>
            </Card>

            <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}} open={openBackLoadingMembros}>
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

            {
                isSuccess && (
                    <ToastSuccess data={{message: showSuccessMessageApi}} visible={true}
                                  setShowParentComponent={setIsSuccess}/>
                )
            }

            <Dialog open={openDialogStatus} onOpenChange={setOpenDialogStatus}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Alterar status</DialogTitle>
                        <DialogDescription>
                            Chegou o momento de alterar o status de membresia.
                        </DialogDescription>
                        <DialogDescription>
                            Escolha abaixo o novo status do membro.
                        </DialogDescription>
                        <DialogDescription>
                            Aproveite para informar a data de atualização e uma descrição breve.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mudar-status">Status</Label>
                            <Select
                                value={mudarStatus}
                                onValueChange={(value: string) => changeStatusMudar(value)}>
                                <SelectTrigger id="mudar-status" aria-label="Status"
                                               className="mt-2 sm:mt-2">
                                    <SelectValue placeholder="Selecionar status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="visitante">Visitante</SelectItem>
                                    <SelectItem value="congregado">Congregado</SelectItem>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="transferido">Transferido</SelectItem>
                                    <SelectItem value="falecido">Falecido</SelectItem>
                                    <SelectItem value="excluido">Excluído</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mudar_data">Data</Label>
                            <Input
                                id="mudar_data"
                                required
                                onChange={(e: any) => setMudarData(e.target.value)}
                                type="date"/>
                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                               id="file_input_help_transferencia">
                                Informe a data de atualização do status
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mudar_motivo">Motivo/Descrição</Label>
                            <Input id="mudar_motivo"
                                   type="text"
                                   onChange={(e: any) => setMudarMotivo(e.target.value)}
                                   placeholder="Digite o motivo..."/>
                        </div>

                        <div className="flex justify-end items-center space-y-2">
                            <Button type="submit" size="sm" className="px-3" disabled={mudarStatus.length < 1}
                                    onClick={(e) => handleMudarStatus(e)}>
                                Salvar
                            </Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={openDialogSendMessage} onOpenChange={setOpenDialogSendMessage}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enviar mensagem via WhatsApp</DialogTitle>

                        <DialogDescription>
                            Número do membro: {memberSelected.telefone}
                        </DialogDescription>
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

            <Dialog open={isOpenMemberDetail} onOpenChange={setIsOpenMemberDetail}>
                <DialogContent
                    className="sm:max-w-[80vw] md:max-w-[95vw] lg:max-w-[95vw] xl:max-w-[75vw] h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Membro</DialogTitle>
                        <DialogDescription>
                            Informações detalhadas sobre o membro da igreja.
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        className="flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-colors duration-200">
                        <UserForm memberParam={memberSelected}/>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}