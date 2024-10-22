'use client'

import * as React from "react"
import {useEffect, useState} from "react"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {useRouter, useSearchParams} from "next/navigation"
import {Backdrop, CircularProgress} from "@mui/material"
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown"
import {IMinisteriosSelect} from "@/lib/models/misterios"
import {ITempUserUpdate, IUser, UserRoles} from "@/lib/models/user"
import {formatDateUS} from "@/lib/helpers/helpers"
import {diaconos} from "@/lib/constants/diaconos"
import {IDiaconoSelect} from "@/lib/models/diaconos"
import {CPFInput, DateInput, EmailInput, PhoneInput, RGInput} from "@/components/form-inputs/form-inputs"
import {ChevronLeftIcon} from "@radix-ui/react-icons"
import {ToastError} from "@/components/toast/toast-error"
import {ToastWarning} from "@/components/toast/toast-warning"
import {UserApi} from "@/lib/api/user-api"
import {ToastSuccess} from "@/components/toast/toast-success"
import {IMinistries} from "@/lib/models/user-response-api"
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";

export default function EditUserForm() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);

    const [isSuccess, setIsSuccess] = useState<boolean>(false)
    const [openBackLoading, setOpenBackLoading] = useState<boolean>(false)

    const [userEditForm, setUserEditForm] = useState<any>({} as ITempUserUpdate);
    const [userEditFormTmp, setUserEditFormTmp] = useState<any>();
    const [showWarningToast, setShowWarningToast] = useState<boolean>(false)
    const [showWarningMessage, setShowWarningMessage] = useState('')
    const [showErrorApi, setShowErrorApi] = useState(false)
    const [showErrorMessageApi, setShowErrorMessageApi] = useState<string>('')
    const [ministries, setMinistries] = useState<IMinistries[]>([])

    const router = useRouter()

    const searchParams = useSearchParams()

    const idMembro: string | null = searchParams.get('id');

    const getAllMinistries = async () => {
        try {
            const response: IMinistries[] = await UserApi.fetchMinistries()
            setMinistries(response && response.length > 0 ? response : [])
        } catch (error: any) {
            console.log(error)
            setMinistries([])
            setShowErrorMessageApi('Erro ao buscar ministérios. Por favor, tente novamente.')
            setShowErrorApi(true)
        }
    }

    const getMemberById = async () => {
        try {
            if (idMembro && idMembro.length > 0) {
                const response = await UserApi.fetchMemberById(idMembro);
                const mapResponse: any = {
                    conjugue: response.conjugue,
                    cpf: response.cpf,
                    data_casamento: response.data_casamento,
                    data_ingresso: response.data_ingresso,
                    data_nascimento: response.data_nascimento,
                    diacono: response.diacono,
                    email: response.email,
                    endereco: response.endereco,
                    estado_civil: response.estado_civil,
                    excluido: response.excluido,
                    falecimento: response.falecimento,
                    filhos: response.filhos,
                    forma_ingresso: response.forma_ingresso,
                    foto: response.foto,
                    local_ingresso: response.local_ingresso,
                    ministerio: response.ministerio,
                    motivo_exclusao: response.motivo_exclusao,
                    motivo_falecimento: response.motivo_falecimento,
                    motivo_transferencia: response.motivo_transferencia,
                    motivo_visita: response.motivo_visita,
                    nome: response.nome,
                    possui_filhos: response.possui_filhos,
                    rg: response.rg,
                    role: response.role,
                    status: response.status,
                    telefone: response.telefone,
                    transferencia: response.transferencia,
                }

                setUserEditForm(mapResponse);
            }
        } catch (error: any) {
            console.log(error)
            setMinistries([])
            setShowErrorMessageApi('Erro ao pelo membro. Por favor, tente novamente.')
            setShowErrorApi(true)
        }
    }

    useEffect(() => {
        if (useStoreIbbZus.hasHydrated && useStoreIbbZus.role === UserRoles.MEMBRO && (!idMembro || idMembro.length === 0)) {
            router.push('/user');
            return;
        }
        if (useStoreIbbZus.hasHydrated && useStoreIbbZus.user == null) {
            router.push('/login');
            return;
        }
        getAllMinistries();
    }, [useStoreIbbZus.hasHydrated])

    useEffect(() => {
        if (useStoreIbbZus.hasHydrated && idMembro && idMembro.length > 0)
            getMemberById();
    }, [ministries])

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

    const ministeriosCadastrados: IMinisteriosSelect[] = ministries.map((ministerio: IMinistries): IMinisteriosSelect => ({
        id: ministerio._id || '',
        label: ministerio.nome
    }))

    const diaconosCadastrados: IDiaconoSelect[] = diaconos.map((diacono: IUser): IDiaconoSelect => ({
        id: diacono.id,
        label: diacono.nome,
        value: diacono.id
    }))

    const handleSubmitUser = async () => {
        setOpenBackLoading(true);

        try {
            userEditFormTmp.possui_filhos = userEditFormTmp.possui_filhos === 'sim';

            const diacono: IDiaconoSelect | undefined = diaconosCadastrados.find((d: IDiaconoSelect) => d.id === Number(userEditFormTmp.diacono))
            userEditFormTmp.diacono = diacono ? {id: diacono.id, nome: diacono.label} : {id: -1, nome: ''}


            if (userEditFormTmp.data_nascimento && userEditFormTmp.data_nascimento.length > 0)
                userEditFormTmp.data_nascimento = formatDateUS(userEditFormTmp.data_nascimento);

            if (userEditFormTmp.data_casamento && userEditFormTmp.data_casamento.length > 0)
                userEditFormTmp.data_casamento = formatDateUS(userEditFormTmp.data_casamento);

            if (idMembro && idMembro.length > 0) {
                await UserApi.updateMember(idMembro, userEditFormTmp);
            }

            setOpenBackLoading(false)
            setIsSuccess(true)
            setShowWarningMessage('')
            setShowWarningToast(false)

            setTimeout(() => router.push('/members'), 1500)
        } catch (error: any) {
            console.log('[TRY-CATCH] error: ', error)
            setOpenBackLoading(false)
            setIsSuccess(false)
            setShowWarningMessage('')
            setShowWarningToast(false)
            setShowErrorApi(true)
            setShowErrorMessageApi(error.response?.data?.message || 'Erro inesperado, tente novamente!')
        }
    }

    const ministeriosSelected = (ministerios: any) => {
        handleUserForm('ministerio', ministerios);
    }

    const handleUserForm = (key: string, event: any) => {
        const fieldValue = ['status', 'ministerio', 'estado_civil', 'possui_filhos', 'diacono', 'forma_ingresso', 'role'].includes(key)
            ? event
            : event.target.value

        setUserEditFormTmp((prevState: any) => ({...prevState, [key]: fieldValue}));
        setUserEditForm((prevState: any) => ({...prevState, [key]: fieldValue}));
    }

    const setFieldValue = (name: string) => {
        if (idMembro && idMembro.length > 0) {
            switch (name) {
                // case 'data_nascimento':
                // case 'data_casamento':
                // case 'transferencia':
                // case 'data_ingresso':
                // case 'falecimento':
                // case 'excluido':
                //     const dateFormat = userEditForm[name]?.toString()?.split('-')[2]?.split('/');
                //
                //     console.log('userEditForm[name]? ', userEditForm[name]);
                //     console.log('dateFormat ', dateFormat);
                //     if (dateFormat) {
                //         return `${dateFormat[2]}-${dateFormat[1]}-${dateFormat[0]}`;
                //     }
                //     break;
                case 'conjugue':
                    return userEditForm[name]?.nome
                case 'diacono':
                    return userEditForm[name]?.id?.toString()
                case 'possui_filhos':
                    return userEditForm[name] ? 'sim' : 'nao'
                default:
                    return userEditForm[name];
            }
        } else
            return ''
    }

    return (
        <div className="container mx-auto mt-4">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    <p>Atualizando membro...</p>
                </div>
            </Backdrop>

            {showWarningToast && (
                <ToastWarning data={{message: showWarningMessage}} visible={true}
                              setShowParentComponent={setShowWarningToast}/>
            )}

            {isSuccess && (
                <ToastSuccess
                    data={{message: 'Membro atualizado com sucesso.'}}
                    visible={true}
                    setShowParentComponent={setIsSuccess}/>
            )}

            {showErrorApi && (
                <ToastError data={{message: showErrorMessageApi}} visible={true}
                            setShowParentComponent={setShowErrorApi}/>
            )}

            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>
                <h2 className="text-black text-3xl font-semibold mb-4 mt-4">
                    Editar Membro
                </h2>
            </section>

            <div className="space-y-6">
                <p className="text-muted-foreground flex justify-items-start items-start flex-col">
                    Edite os campos abaixo para atualizar as informações do membro.
                </p>
                <Card className="w-full">
                    <CardContent className="mt-10">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className={`space-y-2`}>
                                    <Label htmlFor="nome">Nome</Label>
                                    <input
                                        id="nome"
                                        required={false}
                                        value={setFieldValue('nome')}
                                        onChange={(e: any) => handleUserForm('nome', e)}
                                        placeholder="Digite o nome"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <CPFInput
                                        id="cpf"
                                        required={false}
                                        value={setFieldValue('cpf')}
                                        onChange={(e: any) => handleUserForm('cpf', e)}/>

                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rg">RG</Label>
                                    <RGInput
                                        id="rg"
                                        required={false}
                                        value={setFieldValue('rg')}
                                        onChange={(e: any) => handleUserForm('rg', e)}/>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <PhoneInput
                                        id="telefone"
                                        required={false}
                                        value={setFieldValue('telefone')}
                                        onChange={(e: any) => handleUserForm('telefone', e)}/>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                                        <DateInput
                                            id="data_nascimento"
                                            required={false}
                                            value={setFieldValue('data_nascimento')}
                                            onChange={(e: any) => {
                                                handleUserForm('data_nascimento', e)
                                            }}/>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <EmailInput
                                        id="email"
                                        required={false}
                                        value={setFieldValue('email')}
                                        onChange={(e: any) => handleUserForm('email', e)}/>
                                </div>

                                {
                                    useStoreIbbZus.role === UserRoles.ADMIN && (
                                        <div className="space-y-2">
                                            <Label htmlFor="role_select">Nível de acesso</Label>
                                            <Select
                                                required={false}
                                                value={setFieldValue('role')}
                                                onValueChange={(value: string) => handleUserForm('role', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o nível de acesso"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={UserRoles.ADMIN}>Administrador</SelectItem>
                                                    <SelectItem value={UserRoles.MEMBRO}>Membro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                }
                            </div>

                            {/*<div className="grid grid-cols-1 gap-4 space-y-2">*/}
                            {/*    <Label htmlFor="foto">Foto</Label>*/}
                            {/*    {*/}
                            {/*        userEditForm && userEditForm.foto && userEditForm.foto !== '' ? (*/}
                            {/*            <>*/}
                            {/*                <Avatar className="w-20 h-20">*/}
                            {/*                    <AvatarImage*/}
                            {/*                        src={userEditForm && userEditForm.foto ? userEditForm.foto : 'https://github.com/shadcn.png'}/>*/}
                            {/*                    <AvatarFallback>{obterIniciaisPrimeiroUltimo(userEditForm.nome as string)}</AvatarFallback>*/}
                            {/*                </Avatar>*/}

                            {/*                <div*/}
                            {/*                    className="flex items-center justify-center w-full">*/}
                            {/*                    <label htmlFor="foto"*/}
                            {/*                           className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">*/}
                            {/*                        <div*/}
                            {/*                            className="flex flex-col items-center justify-center pt-5 pb-6">*/}
                            {/*                            <svg*/}
                            {/*                                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"*/}
                            {/*                                aria-hidden="true"*/}
                            {/*                                xmlns="http://www.w3.org/2000/svg"*/}
                            {/*                                fill="none"*/}
                            {/*                                viewBox="0 0 20 16">*/}
                            {/*                                <path stroke="currentColor"*/}
                            {/*                                      strokeLinecap="round"*/}
                            {/*                                      strokeLinejoin="round"*/}
                            {/*                                      strokeWidth="2"*/}
                            {/*                                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>*/}
                            {/*                            </svg>*/}

                            {/*                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span*/}
                            {/*                                className="font-semibold">Clique aqui</span> ou*/}
                            {/*                                arraste e*/}
                            {/*                                solte</p>*/}
                            {/*                            <p className="text-xs text-gray-500 dark:text-gray-400">Extensões*/}
                            {/*                                de*/}
                            {/*                                imagens aceitas: PNG, JPG, JPEG</p>*/}
                            {/*                        </div>*/}
                            {/*                        <input*/}
                            {/*                            id="foto"*/}
                            {/*                            onChange={(e: any) => handleUserForm('foto', e)}*/}
                            {/*                            type="file" className="hidden"/>*/}
                            {/*                    </label>*/}
                            {/*                </div>*/}
                            {/*            </>*/}
                            {/*        ) : (*/}
                            {/*            <div className="flex items-center justify-center w-full">*/}
                            {/*                <label htmlFor="foto"*/}
                            {/*                       className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">*/}
                            {/*                    <div*/}
                            {/*                        className="flex flex-col items-center justify-center pt-5 pb-6">*/}
                            {/*                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"*/}
                            {/*                             aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                            {/*                             fill="none"*/}
                            {/*                             viewBox="0 0 20 16">*/}
                            {/*                            <path stroke="currentColor" strokeLinecap="round"*/}
                            {/*                                  strokeLinejoin="round" strokeWidth="2"*/}
                            {/*                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>*/}
                            {/*                        </svg>*/}

                            {/*                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span*/}
                            {/*                            className="font-semibold">Clique aqui</span> ou arraste e*/}
                            {/*                            solte</p>*/}
                            {/*                        <p className="text-xs text-gray-500 dark:text-gray-400">Extensões*/}
                            {/*                            de*/}
                            {/*                            imagens aceitas: PNG, JPG, JPEG</p>*/}
                            {/*                    </div>*/}
                            {/*                    <input*/}
                            {/*                        id="foto"*/}
                            {/*                        onChange={(e: any) => handleUserForm('foto', e)}*/}
                            {/*                        type="file" className="hidden"/>*/}
                            {/*                </label>*/}
                            {/*            </div>*/}
                            {/*        )*/}
                            {/*    }*/}
                            {/*</div>*/}

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                {
                                    useStoreIbbZus.role === UserRoles.ADMIN && (
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                required={false}
                                                value={setFieldValue('status')}
                                                onValueChange={(value: string) => handleUserForm('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status"/>
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
                                    )
                                }

                                <div className="space-y-2">
                                    <Label htmlFor="ministerio">Ministério</Label>
                                    <MultiSelectDropdown
                                        id="ministerio"
                                        required
                                        dataSelected={ministeriosSelected}
                                        data={ministeriosCadastrados}/>
                                </div>
                            </div>

                            {
                                useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'ativo' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="data_ingresso">Ingresso</Label>
                                            <DateInput
                                                id="data_ingresso"
                                                required={false}
                                                value={setFieldValue('data_ingresso')}
                                                onChange={(e: any) => handleUserForm('data_ingresso', e)}
                                            />
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_data_ingresso">
                                                Informe a data de ingresso na igreja
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Forma de ingresso</Label>
                                            <Select
                                                required={!(idMembro && idMembro.length > 0)}
                                                value={setFieldValue('forma_ingresso')}
                                                onValueChange={(value: string) => handleUserForm('forma_ingresso', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a forma de ingresso"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="aclamacao">Aclamação</SelectItem>
                                                    <SelectItem value="batismo">Batismo</SelectItem>
                                                    <SelectItem value="transferencia">Transferência</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>


                                        <div className="space-y-2">
                                            <Label htmlFor="local_ingresso">Local</Label>
                                            <Input id="local_ingresso"
                                                   value={setFieldValue('local_ingresso')}
                                                   onChange={(e: any) => handleUserForm('local_ingresso', e)}
                                                   placeholder="Digite o local de ingresso"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'transferido' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="transferencia">Transferência</Label>
                                            <DateInput
                                                id="transferencia"
                                                required={false}
                                                value={setFieldValue('transferencia')}
                                                onChange={(e: any) => handleUserForm('transferencia', e)}
                                            />
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_transferencia">
                                                Informe a data da transferência do membro
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_transferencia">Motivo de transferência</Label>
                                            <Input id="motivo_transferencia"
                                                   value={setFieldValue('motivo_transferencia')}
                                                   onChange={(e: any) => handleUserForm('motivo_transferencia', e)}
                                                   placeholder="Digite o motivo da transferência"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'falecido' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="falecimento">Falecimento</Label>
                                            <DateInput
                                                id="falecimento"
                                                required={false}
                                                value={setFieldValue('falecimento')}
                                                onChange={(e: any) => handleUserForm('falecimento', e)}
                                            />
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_falecimento">
                                                Informe a data de falecimento do membro
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_falecimento">Descrição/Motivo</Label>
                                            <Input id="motivo_falecimento"
                                                   value={setFieldValue('motivo_falecimento')}
                                                   onChange={(e: any) => handleUserForm('motivo_falecimento', e)}
                                                   placeholder="Digite algo complementar do falecimento"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'excluido' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="excluido">Exclusão</Label>
                                            <DateInput
                                                id="excluido"
                                                required={false}
                                                value={setFieldValue('excluido')}
                                                onChange={(e: any) => handleUserForm('excluido', e)}
                                            />
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_excluido">
                                                Informe a data de exclusão do membro
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_exclusao">Descrição/Motivo</Label>
                                            <Input id="motivo_exclusao"
                                                   value={setFieldValue('motivo_exclusao')}
                                                   onChange={(e: any) => handleUserForm('motivo_exclusao', e)}
                                                   placeholder="Digite o motivo pela exclusão"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'visitante' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_visita">Descrição/Motivo</Label>
                                            <Input id="motivo_visita"
                                                   value={setFieldValue('motivo_visita')}
                                                   onChange={(e: any) => handleUserForm('motivo_visita', e)}
                                                   placeholder="Digite brevemente quando compareceu a igreja para visitação"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                useStoreIbbZus.role === UserRoles.ADMIN && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                                        <div className="space-y-2">
                                            <Label>Diácono</Label>
                                            <Select
                                                required={false}
                                                value={setFieldValue('diacono')}
                                                onValueChange={(value: string) => handleUserForm('diacono', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma opção"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        diaconosCadastrados && diaconosCadastrados.length > 0 && (
                                                            diaconosCadastrados.map((diacono: IDiaconoSelect) => (
                                                                <SelectItem key={diacono.id}
                                                                            value={diacono.id.toString()}>
                                                                    {diacono.label}
                                                                </SelectItem>
                                                            ))
                                                        )
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )
                            }

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Estado civil</Label>
                                    <Select
                                        required={false}
                                        value={setFieldValue('estado_civil')}
                                        onValueChange={(value: string) => handleUserForm('estado_civil', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                            <SelectItem value="casado">Casado(a)</SelectItem>
                                            <SelectItem value="separado">Separado(a)</SelectItem>
                                            <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                            <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tem filhos?</Label>
                                    <Select
                                        required={!(idMembro && idMembro.length > 0)}
                                        value={setFieldValue('possui_filhos')}
                                        onValueChange={(value: string) => handleUserForm('possui_filhos', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sim">Sim</SelectItem>
                                            <SelectItem value="nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {
                                userEditForm.estado_civil === 'casado' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="data_casamento">Data do Casamento</Label>
                                            <DateInput
                                                id="data_casamento"
                                                value={setFieldValue('data_casamento')}
                                                onChange={(e: any) => handleUserForm('data_casamento', e)}
                                            />
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_transferencia">
                                                Informe a data de casamento do membro (caso saiba)
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="conjugue">Nome do(a) cônjugue</Label>
                                            <Input id="conjugue"
                                                   value={setFieldValue('conjugue')}
                                                   onChange={(e: any) => handleUserForm('conjugue', e)}
                                                   placeholder="Digite o nome do(a) conjugue"/>
                                        </div>
                                    </div>
                                )
                            }


                            <div className="flex flex-1 justify-end">
                                <Button type="button" onClick={handleSubmitUser} className="ml-auto">
                                    Atualizar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}