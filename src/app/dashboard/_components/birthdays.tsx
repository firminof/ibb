'use client'

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {PhoneIcon} from "@/components/phone-icon/phone-icon";
import {IDiaconoSelect} from "@/lib/models/diaconos";
import {diaconos} from "@/lib/constants/diaconos";
import {IUser} from "@/lib/models/user";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {IMinisteriosSelect, IMisterios} from "@/lib/models/misterios";
import {ministerios} from "@/lib/constants/misterios";
import {useEffect, useState} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon, ChevronUpIcon, ReloadIcon} from "@radix-ui/react-icons";
import {IUserResponseApi} from "@/lib/models/user-response-api";
import {ToastError} from "@/components/toast/toast-error";
import {Backdrop, CircularProgress} from "@mui/material";
import {useRouter} from "next/navigation";
import {UserApi} from "@/lib/api/user-api";
import {obterMesAtual} from "@/lib/helpers/helpers";
import {IMesAtual} from "@/lib/models/mes-atual";

export function Birthdays(props) {
    const [showErrorApi, setShowErrorApi] = useState(false);
    const [showErrorMessageApi, setShowErrorMessageApi] = useState<string>('');

    const [openBackLoadingMembros, setOpenBackLoadingMembros] = useState(false);
    const [showBackLoadingMessage, setShowBackLoadingMessage] = useState<string>('');

    const router = useRouter();

    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [members, setMembers] = useState<IUserResponseApi[]>([]);
    const [membersToFilter, setMembersToFilter] = useState<IUserResponseApi[]>([]);

    const [mesAtual, setMesAtual] = useState<string>('');

    const [nome, setNome] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [diacono, setDiacono] = useState<string>('');
    const [ministerio, setMinisterio] = useState<number[]>([]);
    const [idade, setIdade] = useState<string>('');
    const [updatedAt, setUpdatedAt] = useState<string>('');

    const ministeriosCadastrados: IMinisteriosSelect[] = ministerios.map((ministerio: IMisterios): IMinisteriosSelect => ({
        id: ministerio.id,
        label: ministerio.nome
    }));

    const diaconosCadastrados: IDiaconoSelect[] = diaconos.map((diacono: IUser): IDiaconoSelect => ({
        id: diacono.id,
        label: diacono.nome,
        value: diacono.nome
    }));

    const ministeriosSelected = (ministerios) => {
        console.log(ministerios);
        setMinisterio((previous: number[]) => {
            return (
                {...previous},
                    ministerios
            );
        });
    }

    const getAllMembers = async (): Promise<void> => {
        setOpenBackLoadingMembros(true);
        setShowBackLoadingMessage('Carregando membros...');

        const {codigo, descricao}: IMesAtual = obterMesAtual();
        setMesAtual(descricao);

        try {
            UserApi.fetchBirthdaysMembers(codigo)
                .then((response) => {
                    if (response.data.length > 0) {
                        setMembers(response.data);
                        setMembersToFilter(response.data);
                        console.log('members: ', response.data);
                        setOpenBackLoadingMembros(false);
                        setShowBackLoadingMessage('');
                        return;
                    }

                    setMembers([]);
                    setMembersToFilter([]);
                    setOpenBackLoadingMembros(false);
                    setShowBackLoadingMessage('');
                })
                .catch((error) => {
                    console.log(error);
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

    useEffect(() => {
        getAllMembers();
    }, []);

    const filtros = (chave, valor, event) => {
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
                const resultMinisterio: IUserResponseApi[] = membersToFilter.filter((member: IUserResponseApi) => {
                    if (member.ministerio.find((ministerio: number) => ministerio.toString() === valor))
                        return member;
                })
                console.log(resultMinisterio);

                // setMinisterio((previous: string) => {
                //     return (
                //         {...previous},
                //             valor
                //     );
                // });
                setMembers(resultMinisterio);
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
                    switch (valor) {
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
    }

    return (
        <div className="mt-5">
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

            <Label className="text-black text-xl font-bold">Aniversariantes do mês: {mesAtual.toUpperCase()}</Label>

            {
                members && members.length > 0 ? (
                    <Card className='mt-5'>
                        <CardHeader>
                            <div className="flex justify-end items-center -mt-6 -mr-6">
                                <Button size="sm" className="font-bold sm:inline-flex md:inline-flex bg-zinc-500"
                                        onClick={() => {
                                            setOpenBackLoadingMembros(true);
                                            setShowBackLoadingMessage('Carregando membros');

                                            setMembers([]);
                                            setMembersToFilter([]);

                                            setTimeout(() => getAllMembers(), 500);
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
                                            <Label htmlFor="status-filter">Filtrar por Status</Label>
                                            <Select onValueChange={(value) => filtros('status', value, null)}
                                                    value={status}>
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
                                            <Label htmlFor="diacono-filter">Filtrar por Diácono</Label>
                                            <Select id="diacono-filter"
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
                                            <Label htmlFor="age-range-filter" className="md:ml-4">Filtrar por Faixa
                                                Etária</Label>
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
                                            <Label htmlFor="age-range-filter" className="md:ml-4">Filtrar por período de
                                                tempo</Label>
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

                        < CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
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
                                            <TableRow key={index}>
                                                <TableCell>{membro.nome}</TableCell>
                                                <TableCell>{membro.data_nascimento}</TableCell>
                                                <TableCell>{membro.diacono.nome ? membro.diacono.nome : (
                                                    <div
                                                        className="py-1 text-yellow-700 font-semibold">Nenhum
                                                        diácono/diaconisa cadastrado
                                                    </div>
                                                )}</TableCell>
                                                <TableCell>{membro.idade}</TableCell>
                                                <TableCell>{membro.ministerio.length > 0 ? membro.ministerio.join(', ') : (
                                                    <div
                                                        className="py-1 text-yellow-700 font-semibold">Nenhum
                                                        ministério cadastrado
                                                    </div>
                                                )}</TableCell>
                                                <TableCell>
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
                                                            membro.status.toUpperCase()
                                                        )
                                                    }

                                                </TableCell>
                                                <TableCell>{membro.updatedAt}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        href="#"
                                                        target="_blank"
                                                        className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                        prefetch={false}
                                                    >
                                                        <PhoneIcon className="w-4 h-4"/>
                                                        Enviar Mensagem
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>

                    </Card>
                ) : (
                    <Card className='mt-5'>
                        <div className="flex justify-center">
                            <CardHeader>
                                <CardTitle>Lista de membros que fazem aniversário em {mesAtual.toUpperCase()} está
                                    vazia!</CardTitle>
                            </CardHeader>
                        </div>
                    </Card>
                )
            }
        </div>
    )
}