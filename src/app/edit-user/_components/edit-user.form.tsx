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
import {ITempUserUpdate, UserRoles} from "@/lib/models/user"
import {formatDateUS} from "@/lib/helpers/helpers"
import {IDiaconoSelect} from "@/lib/models/diaconos"
import {CPFInput, DateInput, EmailInput, PhoneInput, RGInput} from "@/components/form-inputs/form-inputs"
import {ChevronLeftIcon} from "@radix-ui/react-icons"
import {ToastError} from "@/components/toast/toast-error"
import {ToastWarning} from "@/components/toast/toast-warning"
import {UserApi} from "@/lib/api/user-api"
import {ToastSuccess} from "@/components/toast/toast-success"
import {IMinistries, IUserResponseApi} from "@/lib/models/user-response-api"
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";

export default function EditUserForm() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state)

    const [isSuccess, setIsSuccess] = useState<boolean>(false)
    const [openBackLoading, setOpenBackLoading] = useState<boolean>(false)
    const [backLoadingMessage, setBackLoadingMessage] = useState<string>('')

    const [userEditForm, setUserEditForm] = useState<any>({} as ITempUserUpdate)
    const [userEditFormTmp, setUserEditFormTmp] = useState<any>()
    const [showWarningToast, setShowWarningToast] = useState<boolean>(false)
    const [showWarningMessage, setShowWarningMessage] = useState('')
    const [showErrorApi, setShowErrorApi] = useState(false)
    const [showErrorMessageApi, setShowErrorMessageApi] = useState<string>('')

    const [ministries, setMinistries] = useState<IMinistries[]>([])
    const [members, setMembers] = useState<IUserResponseApi[]>([])

    const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const router = useRouter()

    const searchParams = useSearchParams()

    const idMembro: string | null = searchParams.get('id')

    const getAllMinistries = async () => {
        try {
            setOpenBackLoading(true)
            setBackLoadingMessage('Buscando ministérios...')

            const response: IMinistries[] = await UserApi.fetchMinistries()
            setMinistries(response && response.length > 0 ? response : [])

            setOpenBackLoading(false)
            setBackLoadingMessage('')
        } catch (error: any) {
            console.log(error)
            setMinistries([])
            setShowErrorMessageApi('Erro ao buscar ministérios. Por favor, tente novamente.')
            setShowErrorApi(true)

            setOpenBackLoading(false)
            setBackLoadingMessage('')
        }
    }

    const getMemberById = async () => {
        try {
            if (idMembro && idMembro.length > 0) {
                setOpenBackLoading(true)
                setBackLoadingMessage('Buscando informações do membro...')

                const response = await UserApi.fetchMemberById(idMembro)
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

                setUserEditForm(mapResponse)

                setOpenBackLoading(false)
                setBackLoadingMessage('')
            }
        } catch (error: any) {
            console.log(error)
            setOpenBackLoading(false)
            setBackLoadingMessage('')

            setMinistries([])
            setShowErrorMessageApi('Erro ao buscar membro. Por favor, tente novamente.')
            setShowErrorApi(true)
        }
    }

    const getAllMembers = async (): Promise<void> => {
        setOpenBackLoading(true)
        setBackLoadingMessage('Carregando membros...')

        try {
            UserApi.fetchMembers()
                .then((response) => {
                    if (response.data.length > 0) {
                        const mappedMembers: IUserResponseApi[] = response.data.map((member: any) => {
                            return {
                                ...member,
                                ministerio: member.ministerio.map((ministerioId: string) => {
                                    return ministries.find((ministerio: IMinistries) => ministerio._id === ministerioId.toString()) || null
                                })
                            }
                        })
                        setMembers(mappedMembers)
                        return
                    }

                    setMembers([])
                })
                .catch((error) => {
                    console.log(error)
                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setShowErrorMessageApi('Falha na requisição, tente novamente!')
                            setShowErrorApi(true)
                            setMembers([])
                            break
                        case 'ERR_NETWORK':
                            setShowErrorMessageApi('Erro na conexão, tente novamente!')
                            setShowErrorApi(true)
                            setMembers([])
                            break

                        default:
                            setShowErrorMessageApi('Erro genérico do servidor, tente novamente!')
                            setShowErrorApi(true)
                            setMembers([])
                            break
                    }
                })
                .finally(() => {
                    setOpenBackLoading(false)
                    setBackLoadingMessage('')
                })
        } catch (e) {
            setShowErrorMessageApi('Erro desconhecido, tente novamente!')
            setShowErrorApi(true)
            setMembers([])

            setOpenBackLoading(false)
            setBackLoadingMessage('')
        }
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
        getAllMinistries()
        getAllMembers()
    }, [useStoreIbbZus.hasHydrated])

    useEffect(() => {
        if (useStoreIbbZus.hasHydrated && idMembro && idMembro.length > 0) {
            getMemberById()
            getAllMembers()
        }
    }, [ministries])

    const ministeriosCadastrados: IMinisteriosSelect[] = ministries.map((ministerio: IMinistries): IMinisteriosSelect => ({
        id: ministerio._id || '',
        label: ministerio.nome
    }))

    let diaconosCadastrados: IDiaconoSelect[] = members.map((membro: IUserResponseApi): IDiaconoSelect => {
        if (membro && membro.is_diacono) {
            return {
                id: membro && membro._id ? membro._id : '',
                label: membro && membro.nome ? membro.nome : '',
                value: membro && membro._id ? membro._id : ''
            }
        }

        return {
            id: '-1',
            label: '',
            value: ''
        }
    })

    diaconosCadastrados = diaconosCadastrados.filter((diacono: IDiaconoSelect) => diacono.id !== '-1' ? diacono : diacono)

    const handleUserForm = (key: string, event: any) => {
        const fieldValue = ['status', 'ministerio', 'estado_civil', 'possui_filhos', 'diacono', 'forma_ingresso', 'role', 'is_diacono'].includes(key)
            ? event
            : event.target.value

        setUserEditFormTmp((prevState: any) => ({ ...prevState, [key]: fieldValue }))
        setUserEditForm((prevState: any) => ({ ...prevState, [key]: fieldValue }))

        setTouched((prevTouched) => ({ ...prevTouched, [key]: true }))

        validateField(key, fieldValue)
    }

    const validateField = (key: string, value: any) => {
        let error = ''

        switch (key) {
            case 'nome':
                if (!value.trim()) error = 'Nome é obrigatório'
                break
            case 'email':
                if (!value.trim()) {
                    error = 'Email é obrigatório'
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = 'Email inválido'
                }
                break
            case 'cpf':
                if (!value.trim()) {
                    error = 'CPF é obrigatório'
                } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
                    error = 'CPF inválido'
                }
                break
            case 'telefone':
                if (!value.trim()) {
                    error = 'Telefone é obrigatório'
                } else if (!/^$$\d{2}$$\s\d{4,5}-\d{4}$/.test(value)) {
                    error = 'Telefone inválido'
                }
                break
            case 'data_nascimento':
                if (!value) {
                    error = 'Data de nascimento é obrigatória'
                }
                break
        }

        setErrors((prevErrors) => ({ ...prevErrors, [key]: error }))
    }

    const isFormValid = () => {
        return Object.values(errors).every((error) => !error)
    }

    const handleSubmitUser = async () => {
        const allTouched = Object.keys(userEditForm).reduce((acc, key) => {
            acc[key] = true
            return acc
        }, {} as { [key: string]: boolean })
        setTouched(allTouched)

        Object.keys(userEditForm).forEach((key) => {
            validateField(key, userEditForm[key])
        })

        if (!isFormValid()) {
            setShowWarningMessage('Por favor, corrija os erros no formulário antes de enviar.')
            setShowWarningToast(true)
            return
        }

        setOpenBackLoading(true)
        setBackLoadingMessage('Atualizando membro...')

        try {
            userEditFormTmp.possui_filhos = userEditFormTmp.possui_filhos === 'sim'

            const diacono: IDiaconoSelect | undefined = diaconosCadastrados.find((d: IDiaconoSelect) => d.id === userEditFormTmp.diacono)
            userEditFormTmp.diacono = diacono ? { id: diacono.id, nome: diacono.label, is_membro: true } : { id: -1, nome: '' }

            if (userEditFormTmp.data_nascimento && userEditFormTmp.data_nascimento.getTime() > 0)
                userEditFormTmp.data_nascimento = formatDateUS(userEditFormTmp.data_nascimento)

            if (userEditFormTmp.data_ingresso && userEditFormTmp.data_ingresso.getTime() > 0)
                userEditFormTmp.data_ingresso = formatDateUS(userEditFormTmp.data_ingresso)

            if (userEditFormTmp.transferencia && userEditFormTmp.transferencia.getTime() > 0)
                userEditFormTmp.transferencia = formatDateUS(userEditFormTmp.transferencia)

            if (userEditFormTmp.falecimento && userEditFormTmp.falecimento.getTime() > 0)
                userEditFormTmp.falecimento = formatDateUS(userEditFormTmp.falecimento)

            if (userEditFormTmp.excluido && userEditFormTmp.excluido.getTime() > 0)
                userEditFormTmp.excluido = formatDateUS(userEditFormTmp.excluido)

            if (userEditFormTmp.data_casamento && userEditFormTmp.data_casamento.getTime() > 0)
                userEditFormTmp.data_casamento = formatDateUS(userEditFormTmp.data_casamento)

            if (idMembro && idMembro.length > 0) {
                await UserApi.updateMember(idMembro, userEditFormTmp)
            }

            setOpenBackLoading(false)
            setBackLoadingMessage('')

            setIsSuccess(true)
            setShowWarningMessage('')
            setShowWarningToast(false)

            setTimeout(() => router.push('/member-list'), 1500)
        } catch (error: any) {
            console.log('[TRY-CATCH] error: ', error)
            setOpenBackLoading(false)
            setBackLoadingMessage('')

            setIsSuccess(false)
            setShowWarningMessage('')
            setShowWarningToast(false)
            setShowErrorApi(true)
            setShowErrorMessageApi(error.response?.data?.message || 'Erro inesperado, tente novamente!')
        }
    }

    const ministeriosSelected = (ministerios: any) => {
        handleUserForm('ministerio', ministerios)
    }

    const setFieldValue = (name: string) => {
        if (idMembro && idMembro.length > 0) {
            switch (name) {
                case 'conjugue':
                    return userEditForm[name]?.nome
                case 'diacono':
                case 'is_diacono':
                    return userEditForm[name]?.id?.toString()
                case 'possui_filhos':
                    return userEditForm[name] ? 'sim' : 'nao'
                default:
                    return userEditForm[name]
            }
        } else
            return ''
    }

    if (!useStoreIbbZus.hasHydrated) {
        return (
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={!useStoreIbbZus.hasHydrated}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit" />
                    Carregando informações
                </div>
            </Backdrop>
        )
    }

    return (
        <div className="container mx-auto mt-4">
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit" />
                    <p>{backLoadingMessage}</p>
                </div>
            </Backdrop>

            {showWarningToast && (
                <ToastWarning data={{ message: showWarningMessage }} visible={true}
                              setShowParentComponent={setShowWarningToast} />
            )}

            {isSuccess && (
                <ToastSuccess
                    data={{ message: 'Membro atualizado com sucesso.' }}
                    visible={true}
                    setShowParentComponent={setIsSuccess} />
            )}

            {showErrorApi && (
                <ToastError data={{ message: showErrorMessageApi }} visible={true}
                            setShowParentComponent={setShowErrorApi} />
            )}

            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4" /> voltar
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
                                <div className={`space-y-2 ${touched.nome && errors.nome ? 'has-error' : ''}`}>
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input
                                        id="nome"
                                        required={true}
                                        value={setFieldValue('nome')}
                                        onChange={(e: any) => handleUserForm('nome', e)}
                                        onBlur={() => setTouched((prev) => ({ ...prev, nome: true }))}
                                        placeholder="Digite o nome"
                                        className={touched.nome && errors.nome ? 'border-red-500' : ''}
                                    />
                                    {touched.nome && errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className={`space-y-2 ${touched.cpf && errors.cpf ? 'has-error' : ''}`}>
                                    <Label htmlFor="cpf">CPF</Label>
                                    <CPFInput
                                        id="cpf"
                                        required={true}
                                        value={setFieldValue('cpf')}
                                        onChange={(e: any) => handleUserForm('cpf', e)}
                                        onBlur={() => setTouched((prev) => ({ ...prev, cpf: true }))}
                                        className={touched.cpf && errors.cpf ? 'border-red-500' : ''}
                                    />
                                    {touched.cpf && errors.cpf && <p className="text-red-500 text-sm">{errors.cpf}</p>}
                                </div>
                                <div className={`space-y-2 ${touched.rg && errors.rg ? 'has-error' : ''}`}>
                                    <Label htmlFor="rg">RG</Label>
                                    <RGInput
                                        id="rg"
                                        required={false}
                                        value={setFieldValue('rg')}
                                        onChange={(e: any) => handleUserForm('rg', e)}
                                        onBlur={() => setTouched((prev) => ({ ...prev, rg: true }))}
                                        className={touched.rg && errors.rg ? 'border-red-500' : ''}
                                    />
                                    {touched.rg && errors.rg && <p className="text-red-500 text-sm">{errors.rg}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className={`space-y-2 ${touched.telefone && errors.telefone ? 'has-error' : ''}`}>
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <PhoneInput
                                        id="telefone"
                                        required={true}
                                        value={setFieldValue('telefone')}
                                        onChange={(e: any) => handleUserForm('telefone', e)}
                                        onBlur={() => setTouched((prev) => ({ ...prev, telefone: true }))}
                                        className={touched.telefone && errors.telefone ? 'border-red-500' : ''}
                                    />
                                    {touched.telefone && errors.telefone && <p className="text-red-500 text-sm">{errors.telefone}</p>}
                                </div>

                                <div className={`space-y-2 ${touched.data_nascimento && errors.data_nascimento ? 'has-error' : ''}`}>
                                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                                    <DateInput
                                        id="data_nascimento"
                                        required={true}
                                        value={setFieldValue('data_nascimento')}
                                        onChange={(e: any) => handleUserForm('data_nascimento', e)}
                                        onBlur={() => setTouched((prev) => ({ ...prev, data_nascimento: true }))}
                                        className={touched.data_nascimento && errors.data_nascimento ? 'border-red-500' : ''}
                                    />
                                    {touched.data_nascimento && errors.data_nascimento && <p className="text-red-500 text-sm">{errors.data_nascimento}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className={`space-y-2 ${touched.email && errors.email ? 'has-error' : ''}`}>
                                    <Label htmlFor="email">Email</Label>
                                    <EmailInput
                                        id="email"
                                        required={true}
                                        value={setFieldValue('email')}
                                        onChange={(e: any) => handleUserForm('email', e)}
                                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                                        className={touched.email && errors.email ? 'border-red-500' : ''}
                                    />
                                    {touched.email && errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                {useStoreIbbZus.role === UserRoles.ADMIN && (
                                    <div className="space-y-2">
                                        <Label htmlFor="role_select">Nível de acesso</Label>
                                        <Select
                                            required={false}
                                            value={setFieldValue('role')}
                                            onValueChange={(value: string) => handleUserForm('role', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o nível de acesso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={UserRoles.ADMIN}>Administrador</SelectItem>
                                                <SelectItem value={UserRoles.MEMBRO}>Membro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                {useStoreIbbZus.role === UserRoles.ADMIN && (
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                            required={false}
                                            value={setFieldValue('status')}
                                            onValueChange={(value: string) => handleUserForm('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o status" />
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
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="ministerio">Ministério</Label>
                                    <MultiSelectDropdown
                                        id="ministerio"
                                        required
                                        dataSelected={ministeriosSelected}
                                        data={ministeriosCadastrados} />
                                </div>
                            </div>

                            {useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'ativo' && (
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
                                                <SelectValue placeholder="Selecione a forma de ingresso" />
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
                                               placeholder="Digite o local de ingresso" />
                                    </div>
                                </div>
                            )}

                            {useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'transferido' && (
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
                                               placeholder="Digite o motivo da transferência" />
                                    </div>
                                </div>
                            )}

                            {useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'falecido' && (
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
                                               placeholder="Digite algo complementar do falecimento" />
                                    </div>
                                </div>
                            )}

                            {useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'excluido' && (
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
                                               placeholder="Digite o motivo pela exclusão" />
                                    </div>
                                </div>
                            )}

                            {useStoreIbbZus.role === UserRoles.ADMIN && userEditForm.status === 'visitante' && (
                                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="motivo_visita">Descrição/Motivo</Label>
                                        <Input id="motivo_visita"
                                               value={setFieldValue('motivo_visita')}
                                               onChange={(e: any) => handleUserForm('motivo_visita', e)}
                                               placeholder="Digite brevemente quando compareceu a igreja para visitação" />
                                    </div>
                                </div>
                            )}

                            {useStoreIbbZus.role === UserRoles.ADMIN && (
                                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>É um diácono/diaconisa</Label>
                                        <Select
                                            required={false}
                                            value={setFieldValue('is_diacono')}
                                            onValueChange={(value) => handleUserForm('is_diacono', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione se é um diácono/diaconisa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sim">Sim</SelectItem>
                                                <SelectItem value="nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Diácono</Label>
                                        <Select
                                            required={false}
                                            value={setFieldValue('diacono')}
                                            onValueChange={(value: string) => handleUserForm('diacono', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma opção" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {diaconosCadastrados && diaconosCadastrados.length > 0 && (
                                                    diaconosCadastrados.map((diacono: IDiaconoSelect) => (
                                                        <SelectItem key={diacono.id}
                                                                    value={diacono.value.toString()}>
                                                            {diacono.label}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Estado civil</Label>
                                    <Select
                                        required={false}
                                        value={setFieldValue('estado_civil')}
                                        onValueChange={(value: string) => handleUserForm('estado_civil', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção" />
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
                                            <SelectValue placeholder="Selecione uma opção" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sim">Sim</SelectItem>
                                            <SelectItem value="nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {userEditForm.estado_civil === 'casado' && (
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
                                               placeholder="Digite o nome do(a) conjugue" />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-1 justify-end">
                                <Button type="button" onClick={handleSubmitUser} className="ml-auto" disabled={!isFormValid()}>
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