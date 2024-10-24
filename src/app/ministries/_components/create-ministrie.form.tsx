'use client'

import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import {IUser, UserRoles} from "@/lib/models/user";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {ToastError} from "@/components/toast/toast-error";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {ICreateMinisterio, IMinisteriosSelect} from "@/lib/models/misterios";
import {IUserResponseApi} from "@/lib/models/user-response-api";
import {UserApi} from "@/lib/api/user-api";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ToastSuccess} from "@/components/toast/toast-success";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";

export default function CreateMinistrieForm() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);

    const [members, setMembers] = useState<IUserResponseApi[]>([]);
    const [membrosMultiSelect, setMembrosMultiSelect] = useState<IMinisteriosSelect[]>([] as IMinisteriosSelect[]);
    const [openBackLoading, setOpenBackLoading] = useState(false);

    const [ministrieForm, setMinistrieForm] = useState<ICreateMinisterio>({} as ICreateMinisterio);

    const [showWarningToast, setShowWarningToast] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState('');

    const [showErrorApi, setShowErrorApi] = useState(false);
    const [showErrorMessageApi, setShowErrorMessageApi] = useState<string>('');

    const [openBackLoadingMembros, setOpenBackLoadingMembros] = useState(false);
    const [showBackLoadingMessage, setShowBackLoadingMessage] = useState<string>('');

    const [isSuccessSaveMinister, setIsSuccessSaveMinister] = useState<boolean>(false);

    const router = useRouter();

    const getAllMembers = async (): Promise<void> => {
        setOpenBackLoadingMembros(true);
        setShowBackLoadingMessage('Carregando responsáveis...');

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

                            setOpenBackLoadingMembros(false);
                            setShowBackLoadingMessage('');
                        }, 250);
                        return;
                    }

                    setMembers([]);
                    setOpenBackLoadingMembros(false);
                    setShowBackLoadingMessage('');
                })
                .catch((error) => {
                    console.log(error);
                    setMembers([]);
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

    useEffect(() => {
        getAllMembers();
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
        router.push('/login');
    }

    const handleCreateMinistrie = async () => {
        setOpenBackLoading(true);

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
                setOpenBackLoading(false);
                setIsSuccessSaveMinister(true);

                setShowErrorMessageApi('');
                setShowErrorApi(false);

                setShowWarningToast(false);
                setShowWarningMessage('');

                setOpenBackLoadingMembros(false);
                setShowBackLoadingMessage('');
            }, 1000);
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);

            setOpenBackLoading(false);
            setIsSuccessSaveMinister(false);

            setShowErrorMessageApi('Erro ao cadastrar o ministério, tente novamente!');
            setShowErrorApi(true);

            setShowWarningToast(false);
            setShowWarningMessage('');

            setOpenBackLoadingMembros(false);
            setShowBackLoadingMessage('');
        }
    };

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

    const dataSelected = (membersSelected: any) => {
        setMinistrieForm((previous: ICreateMinisterio) => {
            return {...previous, responsavel: membersSelected}
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
                    <p>Cadastrando ministério...</p>
                </div>
            </Backdrop>

            {
                isSuccessSaveMinister && (
                    <ToastSuccess data={{message: 'Ministério cadastrado com sucesso.'}} visible={true}
                                  setShowParentComponent={setIsSuccessSaveMinister}/>
                )
            }

            {
                showWarningToast && (
                    <ToastError data={{message: showWarningMessage}} visible={true}
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
                <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Cadastro de Ministério</h2>
            </section>

            <div className="space-y-6">
                <p className="text-muted-foreground flex justify-items-start items-start flex-col">Preencha os campos
                    abaixo para cadastrar um novo ministério.</p>
                <Card className="w-full">
                    <CardContent className="mt-10">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}