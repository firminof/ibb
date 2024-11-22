'use client'

import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {ITempUserCreate, StatusEnum, UserRoles} from "@/lib/models/user";
import {formatDateUS} from "@/lib/helpers/helpers";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {ToastError} from "@/components/toast/toast-error";
import {ToastWarning} from "@/components/toast/toast-warning";
import {UserApi} from "@/lib/api/user-api";
import {ToastSuccess} from "@/components/toast/toast-success";
import {IMinistries, IUserResponseApi} from "@/lib/models/user-response-api";
import {useStoreIbb} from "@/lib/store/StoreIbb";
import {CPFInput, DateInput, EmailInput, PhoneInput, RGInput} from "@/components/form-inputs/form-inputs";

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

export default function MemberForm() {
    const router = useRouter()
    const { hasHydrated, role, user, addUser, addRole, addMongoId, setHasHydrated } = useStoreIbb()

    const [userForm, setUserForm] = useState<ITempUserCreate>({} as ITempUserCreate)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [showSuccessToast, setShowSuccessToast] = useState(false)
    const [showWarningToast, setShowWarningToast] = useState(false)
    const [warningMessage, setWarningMessage] = useState('')
    const [showErrorToast, setShowErrorToast] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [ministries, setMinistries] = useState<IMinistries[]>([])
    const [members, setMembers] = useState<IUserResponseApi[]>([])
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (hasHydrated && role === UserRoles.MEMBRO) {
            router.push('/user')
            return
        }
        if (hasHydrated && user == null) {
            addUser(null)
            addRole('')
            addMongoId('')
            setHasHydrated(true)
            router.push('/login')
            return
        }
        fetchMinistries()
        fetchMembers()
    }, [hasHydrated, role, user, router, addUser, addRole, addMongoId, setHasHydrated])

    const fetchMinistries = async () => {
        setIsLoading(true)
        setLoadingMessage('Carregando ministérios...')
        try {
            const response = await UserApi.fetchMinistries()
            setMinistries(response)
        } catch (error) {
            console.error('Error fetching ministries:', error)
            setErrorMessage('Erro ao carregar ministérios. Por favor, tente novamente.')
            setShowErrorToast(true)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMembers = async () => {
        setIsLoading(true)
        setLoadingMessage('Carregando membros...')
        try {
            const response = await UserApi.fetchMembers()
            setMembers(response.data)
        } catch (error) {
            console.error('Error fetching members:', error)
            setErrorMessage('Erro ao carregar membros. Por favor, tente novamente.')
            setShowErrorToast(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateUserForm = (key: string, value: any) => {
        setUserForm((prevState) => ({ ...prevState, [key]: value }))
        setErrors((prevErrors) => ({ ...prevErrors, [key]: '' }))
        setTouchedFields((prevTouched) => ({ ...prevTouched, [key]: true }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        const requiredFields = ['nome', 'cpf', 'rg', 'telefone', 'data_nascimento', 'email', 'role', 'status', 'ministerio']

        requiredFields.forEach((field) => {
            if (!userForm[field] || (Array.isArray(userForm[field]) && userForm[field].length === 0)) {
                newErrors[field] = `${field.includes('ministerio') ?
                    field.replace('ministerio', 'Ministério').toUpperCase() :
                    field.replace('_', ' ').toUpperCase()} é obrigatório`
            }
        })

        if (userForm.status === StatusEnum.ativo) {
            ['data_ingresso', 'forma_ingresso', 'local_ingresso'].forEach((field) => {
                if (!userForm[field]) {
                    newErrors[field] = `${field.toUpperCase().replace('_', ' ')} é obrigatório`
                }
            })
        }

        if (userForm.status === StatusEnum.transferido) {
            ['transferencia', 'local_transferencia', 'motivo_transferencia'].forEach((field) => {
                if (!userForm[field]) {
                    newErrors[field] = `${field.includes('transferencia') ?
                        field.replace('transferencia', 'transferência').toUpperCase().replace('_', ' ') :
                        field.replace('_', ' ').toUpperCase()} é obrigatório`
                }
            })
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    useEffect(() => {
        if (userForm.status) {
            validateForm()
        }
    }, [userForm.status])

    const handleCreateUser = async () => {
        if (!validateForm()) {
            setWarningMessage('Por favor, preencha todos os campos obrigatórios.')
            setShowWarningToast(true)
            return
        }

        setIsLoading(true)
        setLoadingMessage('Criando membro...')

        try {
            const payload = buildPayload()
            await UserApi.createMember(payload)
            setShowSuccessToast(true)
            setTimeout(() => router.push('/members'), 1500)
        } catch (error: any) {
            console.error('[CREATE USER ERROR]:', error)
            setShowErrorToast(true)
            setErrorMessage(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const buildPayload = () => {
        const payload = { ...userForm }
        console.log('payload 1: ', payload)
        payload.possui_filhos = payload.possui_filhos === 'sim'
        payload.is_diacono = payload.is_diacono === 'sim'
        payload.data_nascimento = formatDateUS(payload.data_nascimento, 'data_nascimento')
        payload.data_ingresso = formatDateUS(payload.data_ingresso, 'data_ingresso')
        payload.transferencia = formatDateUS(payload.transferencia, 'transferencia')
        payload.falecimento = formatDateUS(payload.falecimento, 'falecimento')
        payload.excluido = formatDateUS(payload.excluido, 'excluido')
        payload.data_casamento = formatDateUS(payload.data_casamento, 'data_casamento')

        payload.motivo_transferencia = payload.motivo_transferencia || ''
        payload.motivo_falecimento = payload.motivo_falecimento || ''
        payload.motivo_exclusao = payload.motivo_exclusao || ''
        payload.motivo_visita = payload.motivo_visita || ''

        if (payload.diacono && payload.diacono.id) {
            const selectedDiacono = members.find((member) => member._id === payload.diacono.id)
            payload.diacono = {
                id: selectedDiacono?._id || -1,
                nome: selectedDiacono?.nome || '',
                is_membro: true
            }
        } else {
            payload.diacono = {
                id: -1,
                nome: '',
                is_membro: true
            }
        }

        console.log('payload 2: ', payload)
        return payload
    }

    const getErrorMessage = (error: any) => {
        if (error.response?.data?.message?.includes('The user with the provided phone number already exists.')) {
            return 'Número de telefone já existente na plataforma, tente outro.'
        }
        return 'Erro ao criar membro. Por favor, tente novamente.'
    }

    if (!hasHydrated) {
        return (
            <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit" />
                    <p>Carregando informações</p>
                </div>
            </Backdrop>
        )
    }

    return (
        <div className="container mx-auto mt-4">
            <Backdrop open={isLoading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit" />
                    <p>{loadingMessage}</p>
                </div>
            </Backdrop>

            {showWarningToast && (
                <ToastWarning
                    data={{ message: warningMessage }}
                    visible={true}
                    setShowParentComponent={setShowWarningToast}
                />
            )}

            {showSuccessToast && (
                <ToastSuccess
                    data={{ message: 'Membro cadastrado com sucesso.' }}
                    visible={true}
                    setShowParentComponent={setShowSuccessToast}
                />
            )}

            {showErrorToast && (
                <ToastError
                    data={{ message: errorMessage }}
                    visible={true}
                    setShowParentComponent={setShowErrorToast}
                />
            )}

            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4" /> voltar
                </Button>
                <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Cadastro de Membro</h2>
            </section>

            <Card className="w-full">
                <CardContent className="mt-10">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">
                                    Nome
                                    <RequiredIndicator />
                                </Label>
                                <Input
                                    id="nome"
                                    value={userForm.nome || ''}
                                    onChange={(e) => handleCreateUserForm('nome', e.target.value)}
                                    placeholder="Digite o nome"
                                    className={`${touchedFields.nome && errors.nome ? 'border-red-500' : ''} ${
                                        errors.nome ? 'border-red-500' : ''
                                    }`}
                                    aria-invalid={errors.nome ? 'true' : 'false'}
                                />
                                {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="cpf">
                                    CPF
                                    <RequiredIndicator />
                                </Label>
                                <CPFInput
                                    id="cpf"
                                    value={userForm.cpf || ''}
                                    onChange={(e) => handleCreateUserForm('cpf', e.target.value)}
                                    className={`${touchedFields.cpf && errors.cpf ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-invalid={errors.cpf ? 'true' : 'false'}
                                />
                                {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rg">
                                    RG
                                    <RequiredIndicator />
                                </Label>
                                <RGInput
                                    id="rg"
                                    value={userForm.rg || ''}
                                    onChange={(e) => handleCreateUserForm('rg', e.target.value)}
                                    className={`${touchedFields.rg && errors.rg ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-invalid={errors.rg ? 'true' : 'false'}
                                />
                                {errors.rg && <p className="text-red-500 text-sm">{errors.rg}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="telefone">
                                    Telefone
                                    <RequiredIndicator />
                                </Label>
                                <PhoneInput
                                    id="telefone"
                                    value={userForm.telefone || ''}
                                    onChange={(e) => handleCreateUserForm('telefone', e.target.value)}
                                    className={`${touchedFields.telefone && errors.telefone ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-invalid={errors.telefone ? 'true' : 'false'}
                                />
                                {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="data_nascimento">
                                    Data de Nascimento
                                    <RequiredIndicator />
                                </Label>
                                <DateInput
                                    id="data_nascimento"
                                    value={userForm.data_nascimento || ''}
                                    onChange={(e) => handleCreateUserForm('data_nascimento', e.target.value)}
                                    className={`${touchedFields.data_nascimento && errors.data_nascimento ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-invalid={errors.data_nascimento ? 'true' : 'false'}
                                />
                                {errors.data_nascimento && <p className="text-red-500 text-sm">{errors.data_nascimento}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email
                                    <RequiredIndicator />
                                </Label>
                                <EmailInput
                                    id="email"
                                    value={userForm.email || ''}
                                    onChange={(e) => handleCreateUserForm('email', e.target.value)}
                                    className={`${touchedFields.email && errors.email ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    aria-invalid={errors.email ? 'true' : 'false'}
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Nível de acesso
                                    <RequiredIndicator />
                                </Label>
                                <Select
                                    value={userForm.role || ''}
                                    onValueChange={(value) => handleCreateUserForm('role', value)}
                                >
                                    <SelectTrigger className={`${touchedFields.role && errors.role ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Selecione o nível de acesso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={UserRoles.ADMIN}>Administrador</SelectItem>
                                        <SelectItem value={UserRoles.MEMBRO}>Membro</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status
                                    <RequiredIndicator />
                                </Label>
                                <Select
                                    value={userForm.status || ''}
                                    onValueChange={(value) => handleCreateUserForm('status', value)}
                                >
                                    <SelectTrigger className={`${touchedFields.status && errors.status ? 'border-red-500' : ''}`}>
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
                                {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ministerio">
                                    Ministério
                                    <RequiredIndicator />
                                </Label>
                                <MultiSelectDropdown
                                    id="ministerio"
                                    data={ministries.map((ministry) => ({ id: ministry._id, label: ministry.nome }))}
                                    dataSelected={(selectedMinistries) => handleCreateUserForm('ministerio', selectedMinistries)}
                                    className={`${touchedFields.ministerio && errors.ministerio ? 'border-red-500' : ''}`}
                                />
                                {errors.ministerio && <p className="text-red-500 text-sm">{errors.ministerio}</p>}
                            </div>
                        </div>

                        {userForm.status === StatusEnum.ativo && (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="data_ingresso">
                                        Data de Ingresso
                                        <RequiredIndicator />
                                    </Label>
                                    <DateInput
                                        id="data_ingresso"
                                        value={userForm.data_ingresso || ''}
                                        onChange={(e) => handleCreateUserForm('data_ingresso', e.target.value)}
                                        className={`${touchedFields.data_ingresso && errors.data_ingresso ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        aria-invalid={errors.data_ingresso ? 'true' : 'false'}
                                        required
                                    />
                                    {errors.data_ingresso && <p className="text-red-500 text-sm">{errors.data_ingresso}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="forma_ingresso">
                                        Forma de Ingresso
                                        <RequiredIndicator />
                                    </Label>
                                    <Select
                                        value={userForm.forma_ingresso || ''}
                                        onValueChange={(value) => handleCreateUserForm('forma_ingresso', value)}
                                        required
                                    >
                                        <SelectTrigger className={`${touchedFields.forma_ingresso && errors.forma_ingresso ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Selecione a forma de ingresso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aclamacao">Aclamação</SelectItem>
                                            <SelectItem value="batismo">Batismo</SelectItem>
                                            <SelectItem value="transferencia">Transferência</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.forma_ingresso && <p className="text-red-500 text-sm">{errors.forma_ingresso}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="local_ingresso">
                                        Local de Ingresso
                                        <RequiredIndicator />
                                    </Label>
                                    <Input
                                        id="local_ingresso"
                                        value={userForm.local_ingresso || ''}
                                        onChange={(e) => handleCreateUserForm('local_ingresso', e.target.value)}
                                        placeholder="Digite o local de ingresso"
                                        className={`${touchedFields.local_ingresso && errors.local_ingresso ? 'border-red-500' : ''}`}
                                        aria-invalid={errors.local_ingresso ? 'true' : 'false'}
                                        required
                                    />
                                    {errors.local_ingresso && <p className="text-red-500 text-sm">{errors.local_ingresso}</p>}
                                </div>
                            </div>
                        )}

                        {userForm.status === 'transferido' && (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="transferencia">Transferência <RequiredIndicator /></Label>
                                    <DateInput
                                        id="transferencia"
                                        value={userForm.transferencia || ''}
                                        onChange={(e) => handleCreateUserForm('transferencia', e.target.value)}
                                        className={`${touchedFields.transferencia && errors.transferencia ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        aria-invalid={errors.transferencia ? 'true' : 'false'}
                                    />
                                    {errors.transferencia && <p className="text-red-500 text-sm">{errors.transferencia}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="local_transferencia">Local de transferência <RequiredIndicator /></Label>
                                    <Input
                                        id="local_transferencia"
                                        value={userForm.local_transferencia || ''}
                                        onChange={(e) => handleCreateUserForm('local_transferencia', e.target.value)}
                                        placeholder="Digite o local anterior à transferência"
                                        className={`${touchedFields.local_transferencia && errors.local_transferencia ? 'border-red-500' : ''}`}
                                        aria-invalid={errors.local_transferencia ? 'true' : 'false'}
                                    />
                                    {errors.local_transferencia && <p className="text-red-500 text-sm">{errors.local_transferencia}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="motivo_transferencia">Motivo de transferência <RequiredIndicator /></Label>
                                    <Input
                                        id="motivo_transferencia"
                                        value={userForm.motivo_transferencia || ''}
                                        onChange={(e) => handleCreateUserForm('motivo_transferencia', e.target.value)}
                                        placeholder="Digite o motivo da transferência"
                                        className={`${touchedFields.motivo_transferencia && errors.motivo_transferencia ? 'border-red-500' : ''}`}
                                        aria-invalid={errors.motivo_transferencia ? 'true' : 'false'}
                                    />
                                    {errors.motivo_transferencia && <p className="text-red-500 text-sm">{errors.motivo_transferencia}</p>}
                                </div>
                            </div>
                        )}

                        {userForm.status === 'falecido' && (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="falecimento">Falecimento</Label>
                                    <DateInput
                                        id="falecimento"
                                        value={userForm.falecimento || ''}
                                        onChange={(e) => handleCreateUserForm('falecimento', e.target.value)}
                                        className={`${touchedFields.falecimento && errors.falecimento ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        aria-invalid={errors.falecimento ? 'true' : 'false'}
                                    />
                                    {errors.falecimento && <p className="text-red-500 text-sm">{errors.falecimento}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="motivo_falecimento">Descrição/Motivo</Label>
                                    <Input
                                        id="motivo_falecimento"
                                        value={userForm.motivo_falecimento || ''}
                                        onChange={(e) => handleCreateUserForm('motivo_falecimento', e.target.value)}
                                        placeholder="Digite algo complementar do falecimento"
                                        className={`${touchedFields.motivo_falecimento && errors.motivo_falecimento ? 'border-red-500' : ''}`}
                                        aria-invalid={errors.motivo_falecimento ? 'true' : 'false'}
                                    />
                                    {errors.motivo_falecimento && <p className="text-red-500 text-sm">{errors.motivo_falecimento}</p>}
                                </div>
                            </div>
                        )}

                        {userForm.status === 'excluido' && (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="excluido">Exclusão</Label>
                                    <DateInput
                                        id="excluido"
                                        value={userForm.excluido || ''}
                                        onChange={(e) => handleCreateUserForm('excluido', e.target.value)}
                                        className={`${touchedFields.excluido && errors.excluido ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        aria-invalid={errors.excluido ? 'true' : 'false'}
                                    />
                                    {errors.excluido && <p className="text-red-500 text-sm">{errors.excluido}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="motivo_exclusao">Descrição/Motivo</Label>
                                    <Input
                                        id="motivo_exclusao"
                                        value={userForm.motivo_exclusao || ''}
                                        onChange={(e) => handleCreateUserForm('motivo_exclusao', e.target.value)}
                                        placeholder="Digite o motivo pela exclusão"
                                        className={`${touchedFields.motivo_exclusao && errors.motivo_exclusao ? 'border-red-500' : ''}`}
                                        aria-invalid={errors.motivo_exclusao ? 'true' : 'false'}
                                    />
                                    {errors.motivo_exclusao && <p className="text-red-500 text-sm">{errors.motivo_exclusao}</p>}
                                </div>
                            </div>
                        )}

                        {userForm.status === 'visitante' && (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                                <div className="space-y-2">
                                    <Label htmlFor="motivo_visita">Descrição/Motivo</Label>
                                    <Input
                                        id="motivo_visita"
                                        value={userForm.motivo_visita || ''}
                                        onChange={(e) => handleCreateUserForm('motivo_visita', e.target.value)}
                                        placeholder="Digite brevemente quando compareceu a igreja para visitação"
                                        className={`${touchedFields.motivo_visita && errors.motivo_visita ? 'border-red-500' : ''}`}
                                        aria-invalid={errors.motivo_visita ? 'true' : 'false'}
                                    />
                                    {errors.motivo_visita && <p className="text-red-500 text-sm">{errors.motivo_visita}</p>}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="is_diacono">É um diácono/diaconisa</Label>
                                <Select
                                    value={userForm.is_diacono ? 'sim' : 'nao' || ''}
                                    onValueChange={(value) => handleCreateUserForm('is_diacono', value)}
                                >
                                    <SelectTrigger className={`${touchedFields.is_diacono && errors.is_diacono ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Selecione se é um diácono/diaconisa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sim">Sim</SelectItem>
                                        <SelectItem value="nao">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.is_diacono && <p className="text-red-500 text-sm">{errors.is_diacono}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="diacono">Diácono</Label>
                                <Select
                                    value={userForm.diacono?.id || ''}
                                    onValueChange={(value) => handleCreateUserForm('diacono', { id: value })}
                                >
                                    <SelectTrigger className={`${touchedFields.diacono && errors.diacono ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Selecione uma opção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.filter((member) => member.is_diacono).map((diacono) => (
                                            <SelectItem key={diacono._id} value={diacono._id}>
                                                {diacono.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.diacono && <p className="text-red-500 text-sm">{errors.diacono}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="estado_civil">Estado civil</Label>
                                <Select
                                    value={userForm.estado_civil || ''}
                                    onValueChange={(value) => handleCreateUserForm('estado_civil', value)}
                                >
                                    <SelectTrigger className={`${touchedFields.estado_civil && errors.estado_civil ? 'border-red-500' : ''}`}>
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
                                {errors.estado_civil && <p className="text-red-500 text-sm">{errors.estado_civil}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="possui_filhos">Tem filhos?</Label>
                                <Select
                                    value={userForm.possui_filhos ? 'sim' : 'nao' || ''}
                                    onValueChange={(value) => handleCreateUserForm('possui_filhos', value)}
                                >
                                    <SelectTrigger className={`${touchedFields.possui_filhos && errors.possui_filhos ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Selecione uma opção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sim">Sim</SelectItem>
                                        <SelectItem value="nao">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.possui_filhos && <p className="text-red-500 text-sm">{errors.possui_filhos}</p>}
                            </div>
                        </div>

                        {userForm.estado_civil === 'casado' && (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="data_casamento">Data do Casamento</Label>
                                    <DateInput
                                        id="data_casamento"
                                        value={userForm.data_casamento || ''}
                                        onChange={(e) => handleCreateUserForm('data_casamento', e.target.value)}
                                        className={`${touchedFields.data_casamento && errors.data_casamento ? 'border-red-500' : ''} w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        aria-invalid={errors.data_casamento ? 'true' : 'false'}
                                    />
                                    {errors.data_casamento && <p className="text-red-500 text-sm">{errors.data_casamento}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nome_conjuge">Nome do Cônjuge</Label>
                                    <Input
                                        id="nome_conjuge"
                                        value={userForm.conjugue?.nome || ''}
                                        onChange={(e) => handleCreateUserForm('nome_conjuge', e.target.value)}
                                        placeholder="Digite o nome do cônjuge"
                                        className={`${touchedFields.nome_conjuge && errors.nome_conjuge ? 'border-red-500' : ''}`}
                                        aria-invalid={errors.nome_conjuge ? 'true' : 'false'}
                                    />
                                    {errors.nome_conjuge && <p className="text-red-500 text-sm">{errors.nome_conjuge}</p>}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-1 justify-end">
                            <Button type="button" onClick={handleCreateUser} className="ml-auto">
                                Salvar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}