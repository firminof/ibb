'use client'

import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import {IUser, UserRoles} from "@/lib/models/user";
import {ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon, Pencil1Icon, ReloadIcon} from "@radix-ui/react-icons";
import {ToastError} from "@/components/toast/toast-error";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {ICreateMinisterio, IEditMinisterio, IMinisteriosResponseApi, IMinisteriosSelect} from "@/lib/models/misterios";
import {IMinistries, IUserResponseApi} from "@/lib/models/user-response-api";
import {UserApi} from "@/lib/api/user-api";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ToastSuccess} from "@/components/toast/toast-success";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {DeleteIcon} from "lucide-react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Checkbox} from "@/components/ui/checkbox";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {ToastWarning} from "@/components/toast/toast-warning";
import {formatNome} from "@/lib/helpers/helpers";

export default function CreateMinistrieForm() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);

    const [members, setMembers] = useState<IUserResponseApi[]>([]);
    const [membrosMultiSelect, setMembrosMultiSelect] = useState<IMinisteriosSelect[]>([] as IMinisteriosSelect[]);
    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [backLoadingMessage, setBackLoadingMessage] = useState('');

    const [ministrieForm, setMinistrieForm] = useState<ICreateMinisterio>({} as ICreateMinisterio);
    const [ministrieEditForm, setMinistrieEditForm] = useState<IEditMinisterio>({} as IEditMinisterio);

    const [showWarningToast, setShowWarningToast] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState('');

    const [showErrorApi, setShowErrorApi] = useState(false);
    const [showErrorMessageApi, setShowErrorMessageApi] = useState<string>('');

    const [openDialogCreateMinistrie, setOpenDialogCreateMinistrie] = useState(false);

    const [openDialogEditMinistrie, setOpenDialogEditMinistrie] = useState(false);

    const [isSuccessSaveMinister, setIsSuccessSaveMinister] = useState<boolean>(false);

    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredMinisterios, setHoveredMinisterios] = useState<IMinisteriosResponseApi>({} as IMinisteriosResponseApi);

    const [ministerios, setMinisterios] = useState<IMinisteriosResponseApi[]>([]);
    const [ministeriosToFilter, setMinisteriosToFilter] = useState<IMinisteriosResponseApi[]>([]);
    const [ministerioSelected, setMinisterioSelected] = useState<IMinisteriosResponseApi>({} as IMinisteriosResponseApi);
    const [ministerioSelectedCheckbox, setMinisterioSelectedCheckbox] = useState<string[]>([]);
    const [isOpenFilter, setIsOpenFilter] = useState(false);

    const [nome, setNome] = useState<string>('');
    const [categoria, setCategoria] = useState<string>('');
    const [responsavel, setResponsavel] = useState<string>('');

    const router = useRouter();

    const getAllMembers = async (): Promise<void> => {
        setOpenBackLoading(true);
        setBackLoadingMessage('Carregando responsáveis...');

        try {
            UserApi.fetchMembers()
                .then((response) => {
                    if (response.data.length > 0) {
                        let mapMembersToSelect: IMinisteriosSelect[] = response.data.map((member: IUserResponseApi): IMinisteriosSelect => ({
                            id: member._id,
                            label: member.nome
                        }));

                        setTimeout(() => {
                            setMembers(response.data);
                            setMembrosMultiSelect(mapMembersToSelect);

                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                        }, 250);
                        return;
                    }

                    setMembers([]);
                    setOpenBackLoading(false);
                    setBackLoadingMessage('');
                })
                .catch((error) => {
                    console.log(error);
                    setMembers([]);
                    setOpenBackLoading(false);
                    setBackLoadingMessage('');

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setShowErrorMessageApi('Falha na requisição, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                            setMembers([]);
                            break;
                        case 'ERR_NETWORK':
                            setShowErrorMessageApi('Erro na conexão, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                            setMembers([]);
                            break;

                        default:
                            setShowErrorMessageApi('Erro genérico do servidor, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                            setMembers([]);
                            break;
                    }
                });
        } catch (e) {
            setShowErrorMessageApi('Erro desconhecido, tente novamente!');
            setShowErrorApi(true);

            setOpenBackLoading(false);
            setBackLoadingMessage('');
            setMembers([]);
        }
    }

    const getAllMinisterios = () => {
        setOpenBackLoading(true);
        setBackLoadingMessage('Carregando ministérios...');

        try {
            UserApi.fetchMinistriesV2()
                .then((response: IMinisteriosResponseApi[]) => {
                    if (response.length > 0) {

                        setTimeout(() => {
                            setMinisterios(response);
                            setMinisteriosToFilter(response)

                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                        }, 250);
                        return;
                    }

                    setMembers([]);
                    setOpenBackLoading(false);
                    setBackLoadingMessage('');
                })
                .catch((error) => {
                    console.log(error);
                    setMembers([]);
                    setOpenBackLoading(false);
                    setBackLoadingMessage('');

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setShowErrorMessageApi('Falha na requisição, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                            setMembers([]);
                            break;
                        case 'ERR_NETWORK':
                            setShowErrorMessageApi('Erro na conexão, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                            setMembers([]);
                            break;

                        default:
                            setShowErrorMessageApi('Erro genérico do servidor, tente novamente!');
                            setShowErrorApi(true);
                            setOpenBackLoading(false);
                            setBackLoadingMessage('');
                            setMembers([]);
                            break;
                    }
                });
        } catch (e) {
            setShowErrorMessageApi('Erro desconhecido, tente novamente!');
            setShowErrorApi(true);

            setOpenBackLoading(false);
            setBackLoadingMessage('');
            setMembers([]);
        }
    }

    useEffect(() => {
        getAllMembers();
        getAllMinisterios();
        setMinisterioSelectedCheckbox([]);
    }, []);

    if (!useStoreIbbZus.hasHydrated) {
        return (
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={!useStoreIbbZus.hasHydrated}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    Carregando informações
                </div>
            </Backdrop>
        )
    }

    if (useStoreIbbZus.role === UserRoles.MEMBRO) {
        router.push('/user');
    }

    if (useStoreIbbZus.user == null) {
        useStoreIbbZus.addUser(null);
        useStoreIbbZus.addRole('');
        useStoreIbbZus.addMongoId('');
        useStoreIbbZus.setHasHydrated(true);
        router.push('/login');
    }

    const handleCreateMinistrie = async () => {
        setOpenBackLoading(true);
        setBackLoadingMessage('Criando ministério...');

        validateForm();

        try {
            // @ts-ignore
            const responsaveis: IUser[] = membrosMultiSelect
                .filter((item: IMinisteriosSelect) => (ministrieForm.responsavel as string[]).includes(item.id as string)) // Filtra apenas os itens que estão no segundo array
                .map((item: IMinisteriosSelect) => ({id: item.id, nome: item.label})); // Mapeia para o formato { id, nome }

            const body: ICreateMinisterio = {
                nome: ministrieForm.nome,
                categoria: ministrieForm.categoria,
                responsavel: responsaveis
            }

            const saveMember = await UserApi.createMinistrie(body);
            setTimeout(() => {
                getAllMinisterios();
                setOpenBackLoading(false);
                setIsSuccessSaveMinister(true);

                setShowErrorMessageApi('');
                setShowErrorApi(false);

                setShowWarningToast(false);
                setShowWarningMessage('');

                setOpenBackLoading(false);
                setBackLoadingMessage('');
                setOpenDialogCreateMinistrie(false);
            }, 1000);
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);

            setOpenBackLoading(false);
            setIsSuccessSaveMinister(false);

            setShowErrorMessageApi('Erro ao cadastrar o ministério, tente novamente!');
            setShowErrorApi(true);

            setShowWarningToast(false);
            setShowWarningMessage('');

            setOpenBackLoading(false);
            setBackLoadingMessage('');
            setOpenDialogCreateMinistrie(false)
        }
    };

    const handleEditMinistrie = async () => {
        setOpenBackLoading(true);
        setBackLoadingMessage('Editando ministério...');

        try {
            if (ministerioSelected && ministerioSelected._id && ministerioSelected._id.length > 0) {
                // @ts-ignore
                const responsaveis: IUser[] = membrosMultiSelect
                    .filter((item: IMinisteriosSelect) => (ministrieEditForm.responsavel as string[]).includes(item.id as string)) // Filtra apenas os itens que estão no segundo array
                    .map((item: IMinisteriosSelect) => ({id: item.id, nome: item.label})); // Mapeia para o formato { id, nome }

                const body: IEditMinisterio = {
                    nome: ministrieEditForm.nome,
                    categoria: ministrieEditForm.categoria,
                    responsavel: responsaveis
                }

                await UserApi.editMinistrie(ministerioSelected._id, body);
                setTimeout(() => {
                    getAllMinisterios();
                    setOpenBackLoading(false);
                    setIsSuccessSaveMinister(true);

                    setShowErrorMessageApi('');
                    setShowErrorApi(false);

                    setShowWarningToast(false);
                    setShowWarningMessage('');

                    setOpenBackLoading(false);
                    setBackLoadingMessage('');
                    setOpenDialogCreateMinistrie(false);

                    setOpenDialogEditMinistrie(false);
                }, 1000);
            } else {
                setShowWarningToast(true);
                setShowWarningMessage('Selecione um membro para editar!');
                setOpenDialogEditMinistrie(false);
            }
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);

            setOpenBackLoading(false);
            setIsSuccessSaveMinister(false);

            setShowErrorMessageApi('Erro ao editar o ministério, tente novamente!');
            setShowErrorApi(true);

            setShowWarningToast(false);
            setShowWarningMessage('');

            setOpenBackLoading(false);
            setBackLoadingMessage('');
            setOpenDialogCreateMinistrie(false);

            setOpenDialogEditMinistrie(false);
        }
    }

    const validateForm = () => {
        if (Object.keys(ministrieForm).length === 0 || Object.keys(ministrieForm).length === 1 || Object.keys(ministrieForm).length === 2) {
            setShowWarningToast(true);
            setShowWarningMessage('Preencha o formulário');
            setOpenBackLoading(false);
            return;
        }

        if (ministrieForm && ministrieForm.nome.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo NOME está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (ministrieForm && ministrieForm.categoria.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo CATEGORIA está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (ministrieForm && ministrieForm.responsavel.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo RESPONSÁVEL está vazio!');
            setOpenBackLoading(false);
            return;
        }
    }

    const handleCreateMinistrieForm = (key: string, event: any) => {
        let fieldValue = '';

        if (key == 'categoria'
        )
            fieldValue = event;
        else
            fieldValue = event.target.value;

        setMinistrieForm((prevState) => ({
            ...prevState,
            [key]: fieldValue
        }));
    }

    const handleEditMinistrieForm = (key: string, event: any) => {
        let fieldValue = '';

        if (key == 'categoria'
        )
            fieldValue = event;
        else
            fieldValue = event.target.value;

        setMinistrieEditForm((prevState) => ({
            ...prevState,
            [key]: fieldValue
        }));
    }

    const dataSelected = (membersSelected: any) => {
        setMinistrieForm((previous: ICreateMinisterio) => {
            return {...previous, responsavel: membersSelected}
        });
    }

    const dataSelectedEdit = (membersSelected: any) => {
        setMinistrieEditForm((previous: ICreateMinisterio) => {
            return {...previous, responsavel: membersSelected}
        });
    }

    const filtros = (chave: string, valor: any, event: any) => {
        if (event) {
            event.preventDefault();
        }

        switch (chave) {
            case 'nome':
                const result: IMinisteriosResponseApi[] = ministeriosToFilter.filter((ministerio: IMinisteriosResponseApi) => (
                    ministerio.nome.toLowerCase().includes(valor.toLowerCase())
                ))
                setNome(valor);
                setMinisterios(result);
                break;
            case 'categoria':
                const resultCategoria: IMinisteriosResponseApi[] = ministeriosToFilter.filter((ministerio: IMinisteriosResponseApi) => (
                    ministerio.categoria.toLowerCase().includes(valor.toLowerCase())
                ))
                setCategoria(valor);
                setMinisterios(resultCategoria);
                break;
            case 'responsavel':
                const resultResponsavel: IMinisteriosResponseApi[] = ministeriosToFilter.filter((ministerio: IMinisteriosResponseApi) => (
                    ministerio.categoria.toLowerCase().includes(valor.toLowerCase())
                ))
                setResponsavel(valor);
                setMinisterios(resultResponsavel);
                break;
        }
    }

    const limparFiltros = () => {
        setNome('');
        setCategoria('');
        setResponsavel('');

        setMinisterios(ministeriosToFilter);
    }

    const handleDeleteMinisterios = (e: any) => {
        setOpenBackLoading(true);
        setBackLoadingMessage(`${ministerioSelectedCheckbox.length === 1 ? 'Excluindo ministério' : 'Excluindo ministérios'}`);

        Promise.all(
            ministerioSelectedCheckbox.map((member: string) => {
                return UserApi.deleteMinisterio(member);
            })
        )
            .then(() => {
                setIsSuccessSaveMinister(true);
                getAllMinisterios();
            })
            .catch(() => {
                setShowErrorApi(true);
                setShowErrorMessageApi(`${ministerioSelectedCheckbox.length === 1 ? 'Erro ao excluir o ministério!' : 'Sucesso ao excluir os ministérios!'}`);
            })
            .finally(() => {
                setOpenBackLoading(false);
                setBackLoadingMessage('');
                getAllMembers();
                setMinisterioSelectedCheckbox([]);
            });
    }

    return (
        <div className="container mx-auto mt-4">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    <p>{backLoadingMessage}</p>
                </div>
            </Backdrop>

            {
                isSuccessSaveMinister && (
                    <ToastSuccess
                        data={{message: `${ministerioSelectedCheckbox.length === 1 ? 'Sucesso ao excluir o ministério!' : 'Sucesso ao excluir os ministérios!'}`}}
                        visible={true}
                        setShowParentComponent={setIsSuccessSaveMinister}/>
                )
            }

            {
                showWarningToast && (
                    <ToastWarning data={{message: showWarningMessage}} visible={true}
                                  setShowParentComponent={setShowWarningToast}/>
                )
            }

            {
                showErrorApi && (
                    <ToastError data={{message: showErrorMessageApi}} visible={true}
                                setShowParentComponent={setShowErrorApi}/>
                )
            }

            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>

                <div className="flex justify-between items-center">
                    <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Ministérios</h2>
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                            onClick={() => setOpenDialogCreateMinistrie(true)}>
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        Adicionar Ministério
                    </Button>
                </div>
            </section>

            <Dialog open={openDialogCreateMinistrie} onOpenChange={setOpenDialogCreateMinistrie}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cadastro de Ministério</DialogTitle>
                        <DialogDescription>
                            Preencha os campos abaixo para cadastrar um novo ministério.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className={`space-y-2`}>
                                <Label htmlFor="nome">Nome</Label>
                                <input
                                    id="nome"
                                    required
                                    onChange={(e: any) => handleCreateMinistrieForm('nome', e)}
                                    placeholder="Digite o nome"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-1 md:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria</Label>
                                <Select
                                    onValueChange={(value: string) => handleCreateMinistrieForm('categoria', value)}>
                                    <SelectTrigger id="categoria" aria-label="categoria"
                                                   className="mt-2 sm:mt-2">
                                        <SelectValue placeholder="Selecionar categoria"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="eclesiastico">Eclesiástico</SelectItem>
                                        <SelectItem value="pessoas">Pessoas</SelectItem>
                                        <SelectItem value="coordenacao">Coordenação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="diacono">Responsável</Label>
                                <MultiSelectDropdown
                                    id="responsaveis"
                                    dataSelected={dataSelected}
                                    data={membrosMultiSelect}/>
                            </div>
                        </div>
                        <div className="flex flex-1 justify-end">
                            <Button type="button" onClick={() => handleCreateMinistrie()} className="ml-auto">
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={openDialogEditMinistrie} onOpenChange={setOpenDialogEditMinistrie}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Ministério</DialogTitle>
                        <DialogDescription>
                            Modifique os campos abaixo para editar o ministério.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className={`space-y-2`}>
                                <Label htmlFor="nome">Nome</Label>
                                <input
                                    id="nome"
                                    required={false}
                                    value={ministrieEditForm.nome}
                                    onChange={(e: any) => handleEditMinistrieForm('nome', e)}
                                    placeholder="Digite o nome"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-1 md:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria</Label>
                                <Select
                                    value={ministrieEditForm && ministrieEditForm.categoria ? ministrieEditForm.categoria : ''}
                                    required={false}
                                    onValueChange={(value: string) => handleEditMinistrieForm('categoria', value)}>
                                    <SelectTrigger id="categoria" aria-label="categoria"
                                                   className="mt-2 sm:mt-2">
                                        <SelectValue placeholder="Selecionar categoria"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="eclesiastico">Eclesiástico</SelectItem>
                                        <SelectItem value="pessoas">Pessoas</SelectItem>
                                        <SelectItem value="coordenacao">Coordenação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="diacono">Responsável</Label>
                                <MultiSelectDropdown
                                    id="responsaveis"
                                    dataSelected={dataSelectedEdit}
                                    required={false}
                                    data={membrosMultiSelect}/>
                            </div>
                        </div>
                        <div className="flex flex-1 justify-end">
                            <Button type="button" onClick={() => handleEditMinistrie()} className="ml-auto">
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <div className="flex justify-end items-center -mt-6 -mr-6 gap-4">
                        {
                            ministerioSelectedCheckbox && ministerioSelectedCheckbox.length > 0 && (
                                <>
                                    <Button size="sm"
                                            className="font-bold sm:inline-flex md:inline-flex bg-red-600 hover:bg-red-700"
                                            onClick={(e) => handleDeleteMinisterios(e)}>
                                        <DeleteIcon className="w-4 h-4 mr-1"/>
                                        {
                                            ministerioSelectedCheckbox.length > 1 ? 'Excluir ministérios' : 'Excluir ministério'
                                        }
                                    </Button>
                                </>
                            )
                        }

                        <Button size="sm" className="font-bold sm:inline-flex md:inline-flex bg-zinc-500"
                                onClick={() => {
                                    setOpenBackLoading(true);
                                    setBackLoadingMessage('Carregando membros');

                                    setMembers([]);
                                    setMinisteriosToFilter([]);

                                    setMinisterioSelected({} as IMinisteriosResponseApi);

                                    setMinisterioSelectedCheckbox([]);
                                    setMinisterios([]);

                                    setTimeout(() => getAllMinisterios(), 500);
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
                                    <Label htmlFor="name-filter">Filtrar por categoria</Label>
                                    <Select
                                        onValueChange={(value: string) => filtros('categoria', value, null)}
                                        value={categoria}>
                                        <SelectTrigger id="categoria" aria-label="categoria"
                                                       className="mt-2 sm:mt-2">
                                            <SelectValue placeholder="Selecionar categoria"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="eclesiastico">Eclesiástico</SelectItem>
                                            <SelectItem value="pessoas">Pessoas</SelectItem>
                                            <SelectItem value="coordenacao">Coordenação</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name-filter">Filtrar por responsável</Label>
                                    <Input
                                        id="name-filter"
                                        className="mt-2"
                                        value={responsavel}
                                        onChange={(e) => filtros('responsavel', e.target.value, e)}
                                        placeholder="Digite o responsável..."/>
                                </div>

                            </div>
                            <Button variant="outline" onClick={() => limparFiltros()}>Limpar filtros</Button>
                        </CollapsibleContent>
                    </Collapsible>

                </CardHeader>
                <CardContent>
                    {
                        ministerios && ministerios.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold"></TableHead>
                                        <TableHead className="font-semibold">Nome</TableHead>
                                        <TableHead className="font-semibold">Categoria</TableHead>
                                        <TableHead className="font-semibold">Responsável</TableHead>
                                        <TableHead className="font-semibold">Última atualização</TableHead>
                                        <TableHead className="font-semibold">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        ministerios.map((ministerio: IMinisteriosResponseApi, index: number) => (
                                            <TableRow
                                                key={ministerio._id}
                                                onMouseEnter={() => {
                                                    setHoveredRow(index);
                                                    setHoveredMinisterios(ministerio);
                                                }}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                className="hover:bg-gray-100 transition"
                                            >
                                                <TableCell>
                                                    <Checkbox id="member-checkbox" onClick={() => {
                                                        setMinisterioSelectedCheckbox((previous: any) => {
                                                            if (previous.includes(ministerio._id as string)) {
                                                                // Se o item já estiver selecionado, removemos ele do array
                                                                return previous.filter((id) => id !== ministerio._id);
                                                            } else {
                                                                // Se o item não estiver selecionado, adicionamos ele ao array
                                                                return [...previous, ministerio._id];
                                                            }
                                                        })
                                                    }}/>
                                                </TableCell>
                                                <TableCell>{ministerio.nome}</TableCell>
                                                <TableCell>{formatNome(ministerio.categoria)}</TableCell>
                                                <TableCell>
                                                    {
                                                        ministerio.responsavel.map((responsavel: IUser, index: number) => {
                                                            if (responsavel) {
                                                                return (
                                                                    <div key={index}>
                                                                        {formatNome(responsavel.nome)}
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

                                                <TableCell>{ministerio.updatedAt}</TableCell>
                                                <TableCell className="inline-flex items-center gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline"
                                                                        onClick={() => {
                                                                            setMinisterioSelected(ministerio);
                                                                            setOpenDialogEditMinistrie(true);
                                                                            setMinistrieEditForm(ministerio);
                                                                        }}>
                                                                    <Pencil1Icon/>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Editar ministério</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex justify-center">
                                <CardHeader>
                                    <CardTitle>Lista de ministérios vazia!</CardTitle>
                                </CardHeader>
                            </div>
                        )
                    }
                </CardContent>
            </Card>
        </div>
    )
}