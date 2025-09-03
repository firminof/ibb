'use client'

import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {format, formatDate} from 'date-fns'
import {CalendarIcon, CameraIcon, ListIcon, PlusCircleIcon, Search, XCircleIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import InputMask from 'react-input-mask'
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {useRouter, useSearchParams} from "next/navigation";
import ReactDatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from "date-fns/locale/pt-BR";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {Backdrop, CircularProgress} from "@mui/material";
import {
    CivilStateEnumV2,
    dataForm, FormaIngressoEnumV2, formatUserV2,
    formSchema,
    FormValuesMember,
    FormValuesUniqueMember,
    MinistriesEntity, StatusEnumV2,
    UserRoles, UserRolesV2
} from "@/lib/models/user";
import {UserApi} from "@/lib/api/user-api";
import {SafeParseError, SafeParseSuccess, ZodIssue} from "zod";
import {compressBase64Image} from "@/lib/helpers/helpers";
import {PasswordSection} from "@/app/invite/_components/password-section";
import {
    SearchableSelect,
    SearchableSelectContent,
    SearchableSelectTrigger,
    SearchableSelectValue
} from "@/components/ui/searchable-select";

// Registrar o local (se necessário)
registerLocale("pt-BR", ptBR);


export default function MemberForm() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state)
    const router = useRouter();
    const [initialData, setInitialData] = useState<FormValuesMember | null>(null)
    const [photo, setPhoto] = useState<string | null>(null)

    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const searchParams = useSearchParams()

    const idMembro: string | null = searchParams.get('id')

    let requestPassword: boolean | null = null;
    let bypass: boolean | null = null;
    let skipLogin: boolean | null = null;

    const requestPasswordParam = searchParams.get('requestPassword');
    const bypassParam = searchParams.get('bypass');
    const skipLoginParam = searchParams.get('skipLogin');

    if (requestPasswordParam !== null) {
        requestPassword = requestPasswordParam.toLowerCase() === 'true';
    }

    if (bypassParam !== null) {
        bypass = bypassParam.toLowerCase() === 'true';
    }

    if (skipLoginParam !== null) {
        skipLogin = skipLoginParam.toLowerCase() === 'true';
    }

    const isEditing: boolean = idMembro && idMembro.length > 0;

    const [ministerios, setMinisterios] = useState<MinistriesEntity[]>([]);
    const [diaconos, setDiaconos] = useState<FormValuesUniqueMember[]>([]);
    const [membros, setMembros] = useState<FormValuesMember[]>([]);

    const [openLoading, setLoading] = useState<boolean>(false);
    const [openLoadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "informacoesPessoais.filhos"
    });

    const [selectedMemberId, setSelectedMemberId] = useState("")

    const onSubmit = async (data: FormValuesMember) => {
        setLoading(true);
        setLoadingMessage(idMembro && idMembro.length > 0 ? 'Editando membro' : 'Salvando membro');
        const result = formSchema.safeParse(data);

        if (!result.success) {
            const errors = result.error.format();
            console.log("Erros encontrados:", errors);
            setLoading(false);
            setLoadingMessage('');
            alert('Erros no formulário. Verifique os campos e tente novamente.');
            return errors;
        }

        try {
            let {_id, ...dataToCreate} = {...data, foto: photo}; // Inicialmente, foto recebe o valor atual de photo
            console.log('dataToCreate: ', dataToCreate);

            if (requestPassword) {
                if (!password || password === '') {
                    setLoading(false)
                    setLoadingMessage('')
                    alert('Erro: Preencha a senha!')
                    return
                }

                if (!confirmPassword || confirmPassword === '') {
                    setLoading(false)
                    setLoadingMessage('')
                    alert('Erro: Preencha a confirmação da senha!')
                    return
                }

                if (password !== confirmPassword) {
                    setLoading(false)
                    setLoadingMessage('')
                    alert('Erro: As senhas não coincidem!')
                    return
                }
            }

            if (useStoreIbbZus.user === null && (
                (bypass === null || !bypass && skipLogin) ||
                (skipLogin === null || !skipLogin && bypass))) {
                alert('Erro: Sua atualização cadastral foi modificada, abra novamente o link que recebeu em outra aba!')
                return
            }

            // Validar se tem pelo menos o email ou telefone
            // if (dataToCreate.email.toString().length === 0 && dataToCreate.telefone.toString().length === 0) {
            //     alert('Adicione um meio de contato: Email ou Telefone');
            //     setLoading(false);
            //     setLoadingMessage('');
            //     return;
            // }

            // Validação de filhos
            if (dataToCreate.informacoesPessoais.temFilhos && dataToCreate.informacoesPessoais.filhos.length === 0) {
                alert('Adicione pelo menos 1 filho se a opção "Tem Filho" está como SIM.');
                setLoading(false);
                setLoadingMessage('');
                return;
            }

            // Validação de filhos
            if (dataToCreate && dataToCreate.informacoesPessoais.temFilhos && dataToCreate.informacoesPessoais.filhos.length > 0) {
                for (let i = 0; i < dataToCreate.informacoesPessoais.filhos.length; i++) {
                    const filho = dataToCreate.informacoesPessoais.filhos[i];

                    // Valida se o filho não tem a propriedade isMember e se tem nome
                    if (!filho.isMember) {
                        // Valida se o filho não tem a propriedade isMember e se tem nome
                        if (filho && filho.id === '' && filho.nome?.length === 0) {
                            filho.id = '';  // Atribui id vazio se o filho não for membro
                        }
                    }
                }
            }

            // Validação de cônjuge
            if (!dataToCreate.informacoesPessoais.casamento.conjugue?.isMember) {
                if (dataToCreate.informacoesPessoais.casamento.conjugue && dataToCreate.informacoesPessoais.casamento.conjugue.nome) {
                    dataToCreate.informacoesPessoais.casamento.conjugue.id = '';
                }
            }

            switch (dataToCreate.informacoesPessoais.estadoCivil) {
                case CivilStateEnumV2.DIVORCIADO:
                case CivilStateEnumV2.SOLTEIRO:
                case CivilStateEnumV2.SEPARADO:
                    dataToCreate.informacoesPessoais.casamento = null;
                    break;
            }

            // Upload da foto se necessário
            if (selectedPhoto) {
                const formData = new FormData();
                formData.append('file', selectedPhoto);

                try {
                    const uploadResponse = await UserApi.uploadPhoto(formData);
                    dataToCreate.foto = uploadResponse.url; // Atribui a URL retornada ao campo foto
                } catch (uploadError) {
                    console.error('Erro ao fazer upload da foto:', uploadError);
                    alert('Erro ao fazer upload da foto. Verifique o arquivo e tente novamente.');
                    setLoading(false);
                    setLoadingMessage('');
                    return;
                }
            }

            // Atualização ou criação do membro
            if (idMembro && idMembro.length > 0) {
                const params = requestPassword ? [idMembro, dataToCreate, password] : [idMembro, dataToCreate, ''];
                await UserApi.updateMember(...params);

                useStoreIbbZus.addTotalMembros(0);
                useStoreIbbZus.addMembros([]);
                useStoreIbbZus.addMinisterios([]);
                useStoreIbbZus.addDiaconos([]);

                alert('Membro editado com sucesso!');
            } else {
                await UserApi.createMember(dataToCreate);
                alert('Membro salvo com sucesso!');
            }

            setLoading(false);
            setLoadingMessage('');
            useStoreIbbZus.role === UserRolesV2.ADMIN ? router.push('/member-list') : router.push('/user');
        } catch (e) {
            console.error('Erro ao salvar membro:', e);
            alert(`Erro: ${e.response?.data?.message || 'Erro desconhecido'}!`);
            setLoading(false);
            setLoadingMessage('');
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        // Ler a imagem como Base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = e.target?.result as string;

            try {
                // Compactar a imagem para largura máxima de 800px e qualidade de 60%
                const compressed = await compressBase64Image(base64Image, 800, 0.6);
                setPhoto(compressed);
                setTimeout(() => {
                    setSelectedPhoto(file);
                }, 200)
            } catch (error) {
                alert('Atenção: somente arquivo de imagem é permitido!')
                console.error('Erro ao compactar a imagem:', error);
            }
        };

        reader.readAsDataURL(file);
    }

    const fetchInitialData = async () => {
        if (idMembro && idMembro.length > 0) {
            try {
                const member = await UserApi.fetchMemberById(idMembro);
                if (member) {
                    const formattedMember = formatUserV2(member);
                    setInitialData(formattedMember);
                    setPhoto(formattedMember.foto || null);
                    form.reset(formattedMember);
                } else {
                    resetFormWithDefaultData();
                }
            } catch (error) {
                console.error('Erro ao carregar membro:', error);
                resetFormWithDefaultData();
            }
            return;
        }

        resetFormWithDefaultData();
    };

    const resetFormWithDefaultData = () => {
        setInitialData(dataForm);
        setPhoto(dataForm.foto || null);
        form.reset(dataForm);
    };

    const fetchData = async () => {
        try {
            const [ministries, diaconos, members] = await Promise.all([
                UserApi.fetchMinistries(),
                UserApi.fetchMembersDiaconos(),
                UserApi.fetchMembers(),
            ]);

            setMinisterios(ministries.length > 0 ? ministries : []);
            setDiaconos(
                diaconos.length > 0
                    ? diaconos
                        .map(diacono => ({
                            nome: diacono.nome,
                            isDiacono: diacono.isDiacono,
                            isMember: true,
                            id: diacono._id.toString(),
                        }))
                        .filter(diacono => diacono.id !== idMembro)
                    : []
            );
            setMembros(members.length > 0 ? members : []);
        } catch (error) {
            console.error('Erro ao carregar dados gerais:', error);
            setMinisterios([]);
            setDiaconos([]);
            setMembros([]);
        }
    };

    useEffect(() => {
        if (!useStoreIbbZus.hasHydrated) return;

        if (useStoreIbbZus.role === UserRoles.MEMBRO && (!idMembro || idMembro.length === 0)) {
            router.push('/user');
            return;
        }

        if (useStoreIbbZus.user == null && (
            (bypass === null || !bypass && skipLogin) ||
            (skipLogin === null || !skipLogin && bypass))) {
            useStoreIbbZus.addUser(null);
            useStoreIbbZus.addRole('');
            useStoreIbbZus.addMongoId('');
            useStoreIbbZus.setHasHydrated(true);
            router.push('/login');
            return;
        }

        const initialize = async () => {
            await fetchData();
            await fetchInitialData();
        };

        initialize();
    }, [useStoreIbbZus.hasHydrated, idMembro]);

    if (!initialData) {
        return <Backdrop
            sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={true}
        >
            <div className="flex flex-col items-center">
                <CircularProgress color="inherit"/>
                Carregando
            </div>
        </Backdrop>
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

    const exibirCardCasamento: boolean = form.watch('informacoesPessoais.estadoCivil') === CivilStateEnumV2.CASADO;

    return (
        <div className="mt-4 mb-4 container mx-auto">
            <section>
                {
                    !bypass && !skipLogin && (
                        <Button variant="outline" className="text-black" onClick={() => router.back()}>
                            <ChevronLeftIcon className="h-4 w-4"/> voltar
                        </Button>
                    )
                }

                {
                    useStoreIbbZus.role === UserRolesV2.ADMIN && (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-black text-3xl font-semibold mb-4 mt-4">{isEditing ? 'Editar Membro' : 'Cadastrar Membro'}</h2>
                            <Button size="sm" className="font-bold sm:inline-flex md:inline-flex mb-3"
                                    onClick={() => router.push('/member-list')}>
                                <ListIcon className="w-4 h-4 mr-1"/>
                                Lista de Membros
                            </Button>
                        </div>
                    )
                }

                {
                    useStoreIbbZus.role === UserRolesV2.MEMBRO && (
                        <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Editar Membro</h2>
                    )
                }
            </section>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identificação Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* FOTO */}
                            <div className="flex flex-col items-center space-y-4">
                                {/* FOTO */}
                                <div className="space-y-2 text-center">
                                    <Label htmlFor="foto">Foto</Label>
                                    <div className="flex flex-col items-center space-y-4">
                                        {photo && (
                                            <img
                                                src={photo}
                                                alt="Foto do membro"
                                                className="w-32 h-32 rounded-full object-cover border-2 border-zinc-800 border-solid p-1"
                                            />
                                        )}
                                        <Label htmlFor="photo-upload"
                                               className="cursor-pointer flex flex-col items-center">
                                            <CameraIcon className="w-12 h-12"/>
                                            <span className="sr-only">Upload foto</span>
                                        </Label>
                                        <Input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                        />
                                        {/* Exibir mensagem de erro */}
                                        {error && <p className="text-red-500 text-sm">{error}</p>}
                                    </div>
                                </div>
                            </div>

                            {/*NOME*/}
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Nome *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/*CPF e RG*/}
                            <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="cpf"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>CPF</FormLabel>
                                            <FormControl>
                                                <InputMask
                                                    mask="999.999.999-99"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    {(inputProps: any) => <Input
                                                        placeholder={"999.999.999-99"} {...inputProps} />}
                                                </InputMask>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {/*RG*/}
                                <FormField
                                    control={form.control}
                                    name="rg"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>RG</FormLabel>
                                            <FormControl>
                                                <Input type="rg" {...field} placeholder={"99.999.999-9"}/>
                                                {/*<InputMask*/}
                                                {/*    mask="99.999.999-9"*/}
                                                {/*    type='text'*/}
                                                {/*    value={field.value}*/}
                                                {/*    onChange={field.onChange}*/}
                                                {/*>*/}
                                                {/*    {(inputProps: any) => <Input*/}
                                                {/*        placeholder={"99.999.999-9"} {...inputProps} />}*/}
                                                {/*</InputMask>*/}
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/*EMAIL e TELEFONE*/}
                            <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} placeholder={"jhon@email.com"}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="telefone"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormControl>
                                                <InputMask
                                                    mask="(99) 99999-9999"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    {(inputProps: any) => <Input
                                                        placeholder={"(99) 99999-9999"} {...inputProps} />}
                                                </InputMask>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/*DATA NASCIMENTO*/}
                            <FormField
                                control={form.control}
                                name="dataNascimento"
                                render={({field}) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data de Nascimento *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[280px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                        ) : (
                                                            <span>Selecione uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <ReactDatePicker
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    showPopperArrow={false} // Remove seta visual (opcional)
                                                    dateFormat="dd/MM/yyyy"
                                                    maxDate={new Date()}
                                                    minDate={new Date("1900-01-01")}
                                                    showMonthDropdown // Exibir dropdown de mês
                                                    showYearDropdown // Exibir dropdown de ano
                                                    dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                    locale="pt-BR" // Local para PT-BR
                                                    className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/*SENHA*/}
                    {
                        requestPassword && (<PasswordSection
                            password={password}
                            setPassword={setPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                        />)
                    }

                    {/*NIVEL DE ACESSO E STATUS MEMBRESIA*/}
                    {
                        useStoreIbbZus.role === UserRolesV2.ADMIN && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nível de Acesso e Status de Membresia</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/*ROLE*/}
                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({field}) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Nível de Acesso *</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={UserRolesV2.ADMIN}/>
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Admin
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={UserRolesV2.MEMBRO}/>
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Membro
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {/*STATUS*/}
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Status de Membresia</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o status"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(StatusEnumV2).map((status) => (
                                                            <SelectItem key={status} value={status}>
                                                                {status}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {/*STATUS ATIVO*/}
                                    {form.watch('status') === StatusEnumV2.ATIVO && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Dados de Ingresso</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="ingresso.data"
                                                    render={({field}) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Data de Ingresso</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-[280px] pl-3 text-left font-normal",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? (
                                                                                format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                            ) : (
                                                                                <span>Selecione uma data</span>
                                                                            )}
                                                                            <CalendarIcon
                                                                                className="ml-auto h-4 w-4 opacity-50"/>
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <ReactDatePicker
                                                                        selected={field.value}
                                                                        onChange={field.onChange}
                                                                        showPopperArrow={false} // Remove seta visual (opcional)
                                                                        dateFormat="dd/MM/yyyy"
                                                                        maxDate={new Date()}
                                                                        minDate={new Date("1900-01-01")}
                                                                        showMonthDropdown // Exibir dropdown de mês
                                                                        showYearDropdown // Exibir dropdown de ano
                                                                        dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                        locale="pt-BR" // Local para PT-BR
                                                                        className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="ingresso.forma"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Forma de Ingresso</FormLabel>
                                                            <Select onValueChange={field.onChange}
                                                                    defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue
                                                                            placeholder="Selecione a forma de ingresso"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {Object.values(FormaIngressoEnumV2).map((formaIngresso: string) => (
                                                                        <SelectItem key={formaIngresso}
                                                                                    value={formaIngresso}>
                                                                            {formaIngresso}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {/*<FormControl>*/}
                                                            {/*    <Input {...field} />*/}
                                                            {/*</FormControl>*/}
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="ingresso.local"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Local de Ingresso</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/*STATUS TRANSFERIDO*/}
                                    {form.watch('status') === StatusEnumV2.TRANSFERIDO && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Transferência</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="transferencia.data"
                                                    render={({field}) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Data de Transferência</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-[280px] pl-3 text-left font-normal",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? (
                                                                                format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                            ) : (
                                                                                <span>Selecione uma data</span>
                                                                            )}
                                                                            <CalendarIcon
                                                                                className="ml-auto h-4 w-4 opacity-50"/>
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <ReactDatePicker
                                                                        selected={field.value}
                                                                        onChange={(date) => field.onChange(new Date(date))}
                                                                        showPopperArrow={false} // Remove seta visual (opcional)
                                                                        dateFormat="dd/MM/yyyy"
                                                                        maxDate={new Date()}
                                                                        minDate={new Date("1900-01-01")}
                                                                        showMonthDropdown // Exibir dropdown de mês
                                                                        showYearDropdown // Exibir dropdown de ano
                                                                        dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                        locale="pt-BR" // Local para PT-BR
                                                                        className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="transferencia.motivo"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Motivo da Transferência</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="transferencia.local"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Local de Transferência</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/*STATUS FALECIDO*/}
                                    {form.watch('status') === StatusEnumV2.FALECIDO && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Falecimento</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="falecimento.data"
                                                    render={({field}) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Data de Falecimento</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-[280px] pl-3 text-left font-normal",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? (
                                                                                format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                            ) : (
                                                                                <span>Selecione uma data</span>
                                                                            )}
                                                                            <CalendarIcon
                                                                                className="ml-auto h-4 w-4 opacity-50"/>
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <ReactDatePicker
                                                                        selected={field.value}
                                                                        onChange={field.onChange}
                                                                        showPopperArrow={false} // Remove seta visual (opcional)
                                                                        dateFormat="dd/MM/yyyy"
                                                                        maxDate={new Date()}
                                                                        minDate={new Date("1900-01-01")}
                                                                        showMonthDropdown // Exibir dropdown de mês
                                                                        showYearDropdown // Exibir dropdown de ano
                                                                        dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                        locale="pt-BR" // Local para PT-BR
                                                                        className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="falecimento.motivo"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Motivo do Falecimento</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="falecimento.local"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Local do Falecimento</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/*STATUS EXCLUIDO*/}
                                    {form.watch('status') === StatusEnumV2.EXCLUIDO && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Exclusão</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="exclusao.data"
                                                    render={({field}) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Data de Exclusão</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-[280px] pl-3 text-left font-normal",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? (
                                                                                format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                            ) : (
                                                                                <span>Selecione uma data</span>
                                                                            )}
                                                                            <CalendarIcon
                                                                                className="ml-auto h-4 w-4 opacity-50"/>
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <ReactDatePicker
                                                                        selected={field.value}
                                                                        onChange={field.onChange}
                                                                        showPopperArrow={false} // Remove seta visual (opcional)
                                                                        dateFormat="dd/MM/yyyy"
                                                                        maxDate={new Date()}
                                                                        minDate={new Date("1900-01-01")}
                                                                        showMonthDropdown // Exibir dropdown de mês
                                                                        showYearDropdown // Exibir dropdown de ano
                                                                        dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                        locale="pt-BR" // Local para PT-BR
                                                                        className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="exclusao.motivo"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Motivo da Exclusão</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/*STATUS VISITANTE*/}
                                    {form.watch('status') === StatusEnumV2.VISITANTE && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Visitas</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="visitas.motivo"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Motivo da Visita</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    }

                    {/*ESTADO CIVIL*/}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/*ESTADO CIVIL*/}
                            <FormField
                                control={form.control}
                                name="informacoesPessoais.estadoCivil"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Estado Civil *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o estado civil"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(CivilStateEnumV2).map((estado) => (
                                                    <SelectItem key={estado} value={estado}>
                                                        {estado}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/*ESTADO CIVIL - CASADO*/}
                            {
                                exibirCardCasamento ? (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Indique seu cônjugue</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Perguntar se o cônjuge é membro */}
                                            <FormField
                                                control={form.control}
                                                name="informacoesPessoais.casamento.conjugue.isMember"
                                                render={({field}) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel>O cônjugue é membro(a)?</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                className="flex flex-col space-y-1"
                                                            >
                                                                <FormItem
                                                                    className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={true}/>
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        Sim
                                                                    </FormLabel>
                                                                </FormItem>
                                                                <FormItem
                                                                    className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={false}/>
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        Não
                                                                    </FormLabel>
                                                                </FormItem>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Condição para exibir campo de seleção de membro ou campo de texto */}
                                            {form.watch("informacoesPessoais.casamento.conjugue.isMember") ? (
                                                <FormField
                                                    control={form.control}
                                                    name="informacoesPessoais.casamento.conjugue.id"
                                                    render={({field}) => (
                                                        <FormField
                                                            control={form.control}
                                                            name="informacoesPessoais.casamento.conjugue.id"
                                                            render={({field: any}) => (
                                                                <FormItem>
                                                                    <FormLabel>Selecione o(a) cônjugue *</FormLabel>
                                                                    <SearchableSelect<FormValuesMember>
                                                                        items={membros}
                                                                        value={field.value}
                                                                        onChange={(value: string) => {
                                                                            setSelectedMemberId(value);
                                                                            field.onChange(value);
                                                                        }}
                                                                        getItemValue={(member) => member._id}
                                                                        getItemLabel={(member) => member.nome}
                                                                        placeholder="Clique para selecionar um membro..."
                                                                        emptyMessage="Nenhum membro encontrado."
                                                                        className="shadow-sm"
                                                                    />
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                />
                                            ) : (
                                                <FormField
                                                    control={form.control}
                                                    name="informacoesPessoais.casamento.conjugue.nome"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Cônjuge *</FormLabel>
                                                            <FormControl>
                                                                <Input {...field}
                                                                       placeholder="Digite o nome do(a) cônjuge"/>
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Data de casamento */}
                                            <FormField
                                                control={form.control}
                                                name="informacoesPessoais.casamento.dataCasamento"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Data do Casamento *</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-[280px] pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "dd/MM/yyyy") // Exibir dia, mês e ano
                                                                        ) : (
                                                                            <span>Selecione uma data</span>
                                                                        )}
                                                                        <CalendarIcon
                                                                            className="ml-auto h-4 w-4 opacity-50"/>
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <ReactDatePicker
                                                                    selected={field.value}
                                                                    onChange={field.onChange}
                                                                    showPopperArrow={false} // Remove seta visual (opcional)
                                                                    dateFormat="dd/MM/yyyy"
                                                                    maxDate={new Date()}
                                                                    minDate={new Date("1900-01-01")}
                                                                    showMonthDropdown // Exibir dropdown de mês
                                                                    showYearDropdown // Exibir dropdown de ano
                                                                    dropdownMode="select" // Alterna para dropdown em vez de scroll
                                                                    locale="pt-BR" // Local para PT-BR
                                                                    className="w-full p-5 text-sm border border-gray-300 rounded-md"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                ) : (<></>)
                            }

                            {/*FILHOS*/}
                            <FormField
                                control={form.control}
                                name="informacoesPessoais.temFilhos"
                                render={({field}) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Tem filhos? *</FormLabel>
                                        <FormMessage/>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem
                                                    className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={true}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Sim
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem
                                                    className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value={false}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Não
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {form.watch("informacoesPessoais.temFilhos") && (
                                <div className="space-y-4">
                                    {fields.map((field, index: number) => (
                                        <Card key={field.id}>
                                            <CardHeader
                                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Filho {index + 1}
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                >
                                                    <XCircleIcon className="h-4 w-4"/>
                                                </Button>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`informacoesPessoais.filhos.${index}.isMember`}
                                                        render={({field}) => (
                                                            <FormItem
                                                                className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel>
                                                                        É membro?
                                                                    </FormLabel>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {form.watch(`informacoesPessoais.filhos.${index}.isMember`) ? (
                                                        <FormField
                                                            control={form.control}
                                                            name={`informacoesPessoais.filhos.${index}.id`}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Selecione o(a) filho(a) *</FormLabel>
                                                                    <SearchableSelect<FormValuesMember>
                                                                        items={membros}
                                                                        value={field.value}
                                                                        onChange={(value: string) => {
                                                                            setSelectedMemberId(value);
                                                                            field.onChange(value);
                                                                        }}
                                                                        getItemValue={(member) => member._id}
                                                                        getItemLabel={(member) => member.nome}
                                                                        placeholder="Clique para selecionar um membro..."
                                                                        emptyMessage="Nenhum membro encontrado."
                                                                        className="shadow-sm"
                                                                    />
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ) : (
                                                        <FormField
                                                            control={form.control}
                                                            name={`informacoesPessoais.filhos.${index}.nome`}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Nome</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => append({
                                            id: '',
                                            nome: '',
                                            isMember: false,
                                            isDiacono: false,
                                        })}
                                    >
                                        <PlusCircleIcon className="mr-2 h-4 w-4"/>
                                        Adicionar Filho
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/*DIACONO e MINISTERIO*/}
                    {
                        useStoreIbbZus.role === UserRolesV2.ADMIN && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Diácono/Diaconisa e Ministério</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/*DIACONO*/}
                                    <FormField
                                        control={form.control}
                                        name="isDiacono"
                                        render={({field}) => (
                                            <FormItem
                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Membro é um diácono ou diaconisa?
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Marque esta opção caso seja.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`diacono.id`}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Selecione o Diácono/Diaconisa</FormLabel>
                                                <SearchableSelect<FormValuesUniqueMember>
                                                    items={diaconos}
                                                    value={field.value as string}
                                                    onChange={(value: string) => {
                                                        setSelectedMemberId(value);
                                                        field.onChange(value);
                                                    }}
                                                    getItemValue={(member) => member.id as string}
                                                    getItemLabel={(member) => member.nome as string}
                                                    placeholder="Clique para selecionar um membro..."
                                                    emptyMessage="Nenhum membro encontrado."
                                                    className="shadow-sm"
                                                />
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {/*MINISTÉRIO*/}
                                    <FormField
                                        control={form.control}
                                        name="ministerio"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">Ministérios</FormLabel>
                                                    <FormDescription>
                                                        Selecione os ministérios em que o membro está envolvido.
                                                    </FormDescription>
                                                </div>
                                                {ministerios.map((item: MinistriesEntity) => (
                                                    <FormField
                                                        key={item}
                                                        control={form.control}
                                                        name="ministerio"
                                                        render={({field}) => {
                                                            return (
                                                                <FormItem
                                                                    key={item}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(item._id)}
                                                                            onCheckedChange={(checked: any) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, item._id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value) => value !== item._id
                                                                                        )
                                                                                    )
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {item.nome}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )
                    }

                    <Card>
                        <CardHeader>
                            <CardTitle>Endereço (Opcional)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-1 sm:grid-cols-1 gap-4">
                                <div className="flex justify-center items-end gap-2">
                                    <FormField
                                        control={form.control}
                                        name="endereco.cep"
                                        render={({field}) => (
                                            <FormItem className="flex-grow">
                                                <FormLabel>CEP</FormLabel>
                                                <FormControl>
                                                    <InputMask
                                                        mask="99999-999"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    >
                                                        {(inputProps: any) => (
                                                            <Input placeholder="99999-999" {...inputProps} />
                                                        )}
                                                    </InputMask>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={async () => {
                                                const cep = form.getValues("endereco.cep")?.replace(/\D/g, "");
                                                if (cep?.length === 8) {
                                                    try {
                                                        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                                        const data = await res.json();
                                                        if (!data.erro) {
                                                            form.setValue("endereco.rua", data.logradouro || "");
                                                            form.setValue("endereco.bairro", data.bairro || "");
                                                            form.setValue("endereco.cidade", data.localidade || "");
                                                            form.setValue("endereco.estado", data.uf || "");
                                                            form.setValue("endereco.numero", data.unidade || "");
                                                            form.setValue("endereco.complemento", data.complemento || "");
                                                        } else {
                                                            alert("CEP não encontrado.");
                                                        }
                                                    } catch (error) {
                                                        console.error("Erro ao buscar CEP:", error);
                                                        alert("Erro ao buscar CEP.");
                                                    }
                                                } else {
                                                    alert("CEP inválido.");
                                                }
                                            }}
                                        >
                                            Buscar
                                        </Button>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="endereco.rua"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Rua</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endereco.numero"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Número</FormLabel>
                                            <FormControl>
                                                <Input{...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="endereco.complemento"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Complemento</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="endereco.bairro"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Bairro</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endereco.cidade"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Cidade</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="endereco.estado"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-1 justify-end mt-4 mb-4">
                        <Button type="submit" className="ml-auto" onClick={() => {
                            console.log(form.getValues());
                            const result: SafeParseSuccess<FormValuesMember> | SafeParseError<FormValuesMember> = formSchema.safeParse(form.getValues());
                            console.log(result);
                            const errorMessages: string[] = [];
                            if (result && result.error && result.error.issues) {
                                result.error.issues.forEach((errorItem: ZodIssue) => {
                                    errorMessages.push(errorItem.message);
                                })
                                alert(errorMessages);
                            }
                        }}>
                            {isEditing ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}