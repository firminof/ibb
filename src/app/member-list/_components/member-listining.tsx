'use client'

import * as React from 'react'
import {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Checkbox} from "@/components/ui/checkbox"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {Edit, Eye, Filter, RefreshCw, Trash, Trash2, UserCog, ViewIcon} from 'lucide-react'
import {format} from 'date-fns'
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {SafeParseError, SafeParseSuccess, ZodIssue} from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {FormValuesMember, FormValuesUniqueMember, statusColors, StatusEnumV2, UserRoles} from "@/lib/models/user";
import InputMask from "react-input-mask";
import {ArrowRightIcon, ChevronLeftIcon} from "@radix-ui/react-icons";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {useRouter} from "next/navigation";
import {UserApi} from "@/lib/api/user-api";
import {IMinistries} from "@/lib/models/user-response-api";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Backdrop, CircularProgress} from "@mui/material";
import ptBR from "date-fns/locale/pt-BR";
import {Card, CardContent} from "@/components/ui/card";
import {SendIcon} from "@/components/send-icon/send-icon";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {EmailInput, PhoneInput} from "@/components/form-inputs/form-inputs";
import {emailRegex} from "@/lib/helpers/helpers";
import {IInviteByEmail} from "@/lib/models/invite";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {ToastSuccess} from "@/components/toast/toast-success";

// Status validation schema
const statusUpdateSchema = z.object({
    status: z.nativeEnum(StatusEnumV2),
    visitas: z.object({
        motivo: z.string({required_error: "Motivo é obrigatório"}).min(1).nullable(),
    }).optional(),
    ingresso: z.object({
        data: z.string({required_error: "Data de ingresso é obrigatória"}).nullable(),
        forma: z.string({required_error: "Forma é obrigatória"}).min(1).nullable(),
        local: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
    transferido: z.object({
        data: z.string({required_error: "Data de transferência é obrigatória"}).nullable(),
        motivo: z.string({required_error: "Motivo é obrigatório"}).min(1).nullable(),
        local: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
    falecido: z.object({
        data: z.string({required_error: "Data de falecimento é obrigatória"}).nullable(),
        motivo: z.string({required_error: "Motivo é obrigatória"}).min(1).nullable(),
        local: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
    excluido: z.object({
        data: z.string({required_error: "Data de exclusão é obrigatória"}).nullable(),
        motivo: z.string({required_error: "Local é obrigatório"}).min(1).nullable(),
    }).optional(),
});

const memberSchema = z.object({
    id: z.string().nullable(),
    nome: z.string().nullable(),
    isMember: z.boolean(),
    isDiacono: z.boolean(),
})

// Enum para MinisterioCategoriasEnum
const MinisterioCategoriasEnum = z.enum(['eclesiastico', 'pessoas', 'coordenacao']); // Substitua pelas categorias reais

// Schema para MinistrieEntity
const MinistrieEntitySchema = z.object({
    _id: z.string().optional(),
    nome: z.string(),
    categoria: MinisterioCategoriasEnum,
    responsavel: z.array(memberSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Uso do schema
type MinistriesEntity = z.infer<typeof MinistrieEntitySchema>;

export default function MemberListing() {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItemFiltered, setTotalItemFiltered] = useState(0)
    const [indexOfLastItem, setIndexOfLastItem] = useState(1)
    const [indexOfFirstItem, setIndexOfFirstItem] = useState(1)

    const useStoreIbbZus = useStoreIbb((state: IStore) => state);
    const router = useRouter();

    const [ministerios, setMinisterios] = useState<MinistriesEntity[]>([]);
    const [diaconos, setDiaconos] = useState<FormValuesUniqueMember[]>([]);
    const [membros, setMembros] = useState<FormValuesMember[]>([]);

    const [requestPassword, setRequestPassword] = useState(false);

    const [openLoading, setLoading] = useState<boolean>(false);
    const [openLoadingMessage, setLoadingMessage] = useState<string>('');

    const [filteredMembers, setFilteredMembers] = useState<FormValuesMember[]>([])
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [filters, setFilters] = useState({
        nome: '',
        telefone: '',
        isDiacono: 'all',
        status: 'all',
        hasEmail: 'all',
        hasTelefone: 'all'
    })
    const [selectedMember, setSelectedMember] = useState<FormValuesMember | null>(null);
    const form = useForm<z.infer<typeof statusUpdateSchema>>({
        resolver: zodResolver(statusUpdateSchema),
    });

    const [isSuccessSendInvite, setIsSuccessSendInvite] = useState(false);
    const [isModeInviteEmail, setIsModeInviteEmail] = useState(true);
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [openDialogInvite, setOpenDialogInvite] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({...prev, [key]: value}))
    }

    const handleSelectMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
        )
    }

    const handleResetFilter = () => {
        setFilters({
            nome: '',
            telefone: '',
            isDiacono: 'all',
            status: 'all',
            hasEmail: 'all',
            hasTelefone: 'all'
        })
    }

    const handleDeleteSelected = () => {
        setLoading(true);
        setLoadingMessage('Excluindo membro...');
        console.log('Deleting members:', selectedMembers)

        Promise.all(
            selectedMembers.map((member: string) => {
                return UserApi.deleteMember(member);
            })
        )
            .then(() => {
                alert(`${selectedMembers.length === 1 ? 'Sucesso ao excluir o membro!' : 'Sucesso ao excluir os membros!'}`);
            })
            .catch(() => {
                alert(`${selectedMembers.length === 1 ? 'Erro ao excluir o membro!' : 'Sucesso ao excluir os membros!'}`)
            })
            .finally(async () => {
                setLoading(false);
                setLoadingMessage('');

                handleResetFilter();
                fetchMembers();
                setSelectedMembers([]);
            });
    }

    const handleRequestUpdate = () => {
        setLoading(true);
        setLoadingMessage('Solicitando atualizando cadastral...');
        console.log('Requesting update for members:', selectedMembers)

        try {
            if (selectedMembers && selectedMembers.length > 0) {
                UserApi.requestUpdateUserInfo({_id: selectedMembers}, requestPassword)
                    .then((response: FormValuesMember) => {
                        alert(`Atualização cadastral solicitada com sucesso!`);
                    })
                    .catch((error) => {
                        console.log(error);
                        switch (error.code) {
                            case 'ERR_BAD_REQUEST':
                                console.log(error);
                                break;
                            case 'ERR_NETWORK':
                                console.log(error);
                                break;

                            default:
                                console.log(error);
                                break;
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                        setLoadingMessage('');
                        setSelectedMembers([]);
                    })
            }
        } catch (e) {
            setLoading(false);
            setLoadingMessage('');
            setSelectedMembers([]);
        }

        setLoading(false);
        setLoadingMessage('');
    }

    const handleReloadTable = () => {
        useStoreIbbZus.addTotalMembros(0);
        useStoreIbbZus.addMembros([]);
        useStoreIbbZus.addDiaconos([]);
        useStoreIbbZus.addMinisterios([]);

        setTimeout(() => {
            handleResetFilter();
            fetchMembers();
        }, 300)
    }

    const handleConvidarMembro = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setLoadingMessage(`Enviando convite ${isModeInviteEmail ? 'por email' : 'por WhatsApp'}`);

        try {
            if (isModeInviteEmail) {
                const validateEmail = emailRegex.test(email);

                if (!validateEmail) {
                    alert('Email inválido, insira um corretamente!');

                    setOpenDialogInvite(false);
                    setIsSuccessSendInvite(true);

                    setLoading(false);
                    setLoadingMessage('');
                    return;
                }
            }

            const body: IInviteByEmail = {
                to: email,
                subject: 'Convite para membresia',
                text: 'Você está sendo convidado para fazer parte da Igreja Batista do Brooklink',
                requestName: '',
                phone: whatsapp,
                memberIdRequested: useStoreIbbZus.mongoId
            };

            const sendingEmail = await UserApi.sendInvite(body)

            if (sendingEmail) {
                setOpenDialogInvite(false);
                setIsSuccessSendInvite(true);
                setEmail('');
                setIsModeInviteEmail(true);
                setWhatsapp('');
            }

            setLoading(false);
            setLoadingMessage('');
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenDialogInvite(false);
            setIsSuccessSendInvite(false);
            setEmail('');
            setIsModeInviteEmail(true);
            setWhatsapp('');

            setLoading(false);
            setLoadingMessage('');
        }
    }

    const handleStatusChange = (member: FormValuesMember) => {
        setSelectedMember(member)
        let valorAtual;

        switch (member.status) {
            case StatusEnumV2.VISITANTE:
                valorAtual = {visitas: member.visitas};
                break;
            case StatusEnumV2.ATIVO:
                valorAtual = {ingresso: member.ingresso};
                break;
            case StatusEnumV2.TRANSFERIDO:
                valorAtual = {transferencia: member.transferencia};
                break;
            case StatusEnumV2.FALECIDO:
                valorAtual = {falecimento: member.falecimento};
                break;
            case StatusEnumV2.EXCLUIDO:
                valorAtual = {exclusao: member.exclusao};
                break;
        }

        form.reset({
            status: member.status,
            ...valorAtual
        })
    }


    const handleStatusUpdateSubmit = (data: any) => {
        setLoading(true);
        setLoadingMessage('Atualizando status do membro');

        const result = statusUpdateSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.format();
            console.error("Validation Errors:", errors);
            alert('Atenção! Preencha corretamente os campos para atualização do status do membro.');
        } else {
            try {
                if (selectedMember && selectedMember._id) {
                    UserApi.updateMember(selectedMember._id, data)
                        .then((response: FormValuesMember) => {
                            alert(`Status do membro: ${selectedMember.nome} atualizado`);
                            handleReloadTable();
                        })
                        .catch((error) => {
                            console.log(error);
                            switch (error.code) {
                                case 'ERR_BAD_REQUEST':
                                    setMembros([]);
                                    handleReloadTable();
                                    break;
                                case 'ERR_NETWORK':
                                    setMembros([]);
                                    handleReloadTable();
                                    break;

                                default:
                                    setMembros([]);
                                    handleReloadTable();
                                    break;
                            }
                        })
                        .finally(() => {
                            setLoading(false);
                            setLoadingMessage('');
                            form.reset();
                            handleReloadTable();
                        })
                }
            } catch (e) {
                setLoading(false);
                setLoadingMessage('');
                form.reset();
                handleReloadTable();
            }
        }
    };

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

    const fetchMembers = async () => {
        if (useStoreIbbZus.hasHydrated) {
            if (useStoreIbbZus.role === UserRoles.MEMBRO) {
                router.push('/user');
                return;
            }

            if (useStoreIbbZus.user == null) {
                useStoreIbbZus.addUser(null);
                useStoreIbbZus.addRole('');
                useStoreIbbZus.addMongoId('');
                useStoreIbbZus.setHasHydrated(true);
                useStoreIbbZus.addPhoto('');
                useStoreIbbZus.addLoggout(true);
                useStoreIbbZus.addMembros([]);
                useStoreIbbZus.addTotalMembros(0);
                useStoreIbbZus.addDiaconos([]);
                useStoreIbbZus.addMinisterios([]);
                router.push('/login');
                return;
            }
        }

        try {
            resetPageValues();

            setLoading(true);
            setLoadingMessage('Carregando...');

            const totalMembros = await UserApi.fetchTotalMembers();

            if (totalMembros.total !== useStoreIbbZus.totalMembros) {
                const [ministries, diaconos, members] = await Promise.all([
                    UserApi.fetchMinistries(),
                    UserApi.fetchMembersDiaconos(),
                    UserApi.fetchMembers(),
                ]);

                setMinisterios(ministries.length > 0 ? ministries : []);
                setDiaconos(
                    diaconos.length > 0
                        ? diaconos.map(diacono => ({
                            nome: diacono.nome,
                            isDiacono: diacono.isDiacono,
                            isMember: true,
                            id: diacono._id.toString(),
                        }))
                        : []
                );
                setMembros(members.length > 0 ? members : []);

                useStoreIbbZus.addTotalMembros(totalMembros.total);
                useStoreIbbZus.addMembros(members);

                useStoreIbbZus.addMinisterios(ministries);
                useStoreIbbZus.addDiaconos(diaconos);

                return;
            }

            console.log('Recuperando do estado!')
            setMinisterios(useStoreIbbZus.ministerios);
            setDiaconos(useStoreIbbZus.diaconos);
            setMembros(useStoreIbbZus.membros);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setMinisterios([]);
            setDiaconos([]);
            setMembros([]);
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    useEffect(() => {
        if (!useStoreIbbZus.hasHydrated) return;

        fetchMembers();
    }, [useStoreIbbZus.hasHydrated]);

    const mapMinisterios = (member: FormValuesMember) => {
        // Filtra os ministérios cujos _id estão no array ids e retorna os nomes correspondentes.
        return ministerios
            .filter((ministerio: MinistriesEntity) => member.ministerio.includes(ministerio._id))
            .map((ministerio: MinistriesEntity): string => ministerio.nome ? ministerio.nome : '-').join(', ');
    }

    const resetPageValues = () => {
        setCurrentPage(1);
        setIndexOfLastItem(1);
        setIndexOfFirstItem(1);
        setTotalPages(1);
        setTotalItemFiltered(0);
        setFilteredMembers([]);
        setSelectedMembers([]);
        setMembros([]);
        setMinisterios([]);
        setDiaconos([]);
        setFilters({
            nome: '',
            telefone: '',
            isDiacono: 'all',
            status: 'all',
            hasEmail: 'all',
            hasTelefone: 'all'
        })
    }

    const applyFilters = () => {
        const filtered: FormValuesMember[] = membros.filter(member =>
            member.nome.toLowerCase().includes(filters.nome.toLowerCase()) &&
            member.telefone?.includes(filters.telefone) &&
            (member.status === filters.status || filters.status === 'all') &&
            (filters.isDiacono === 'all' || member.isDiacono.toString() === filters.isDiacono) &&
            (filters.hasTelefone === 'all' || (filters.hasTelefone === 'true' ? member.telefone?.length > 0 : member.telefone?.length === 0)) &&
            (filters.hasEmail === 'all' || (filters.hasEmail === 'true' ? member.email?.length > 0 : member.email?.length === 0))
        )

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;

        setIndexOfLastItem(currentPage * itemsPerPage);
        setIndexOfFirstItem(indexOfLastItem - itemsPerPage);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage))
        setTotalItemFiltered(filtered.length);

        setTimeout(() => setFilteredMembers(filtered.slice(indexOfFirstItem, indexOfLastItem)), 100);
    }

    const handlePageChange = (pageNumber: number) => {
        setTimeout(() => {
            setCurrentPage(pageNumber)
            setIndexOfLastItem(currentPage * itemsPerPage);
            setIndexOfFirstItem(indexOfLastItem - itemsPerPage);

            setTimeout(() => applyFilters(), 200);
        }, 100)
    }

    const handleItemsPerPageChange = (value: string) => {
        setTimeout(() => {
            setItemsPerPage(Number(value))
            setCurrentPage(1)

            setIndexOfLastItem(currentPage * itemsPerPage);
            setIndexOfFirstItem(indexOfLastItem - itemsPerPage);

            setTimeout(() => applyFilters(), 200);
        }, 100);
    }

    useEffect(() => {
        applyFilters();
    }, [membros, filters, applyFilters])
    
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

    return (
        <div className="container mx-auto py-10">
            {
                isSuccessSendInvite && (
                    <ToastSuccess data={{message: 'Convite enviado com sucesso!'}} visible={true}
                                  setShowParentComponent={setIsSuccessSendInvite}/>
                )
            }
            <section>
                {/* Botão Voltar */}
                <div className="mb-4">
                    <Button
                        variant="outline"
                        className="text-black flex items-center gap-2"
                        onClick={() => router.back()}
                    >
                        <ChevronLeftIcon className="h-4 w-4" /> Voltar
                    </Button>
                </div>

                {/* Título e Ações */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Título */}
                    <h2 className="text-black text-2xl sm:text-3xl font-semibold">
                        Membros
                    </h2>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap justify-end items-center gap-4">
                        <Button
                            size="sm"
                            className="font-bold flex items-center gap-2"
                            onClick={() => router.push('/member')}
                        >
                            <PlusIcon className="w-4 h-4" />
                            Adicionar Membro
                        </Button>

                        <Dialog open={openDialogInvite} onOpenChange={setOpenDialogInvite}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 font-bold flex items-center gap-2"
                                    onClick={() => setOpenDialogInvite(true)}
                                >
                                    <SendIcon className="w-4 h-4" />
                                    Convidar Membro
                                </Button>
                            </DialogTrigger>

                            {/* Conteúdo do Diálogo */}
                            <DialogContent className="w-full max-w-sm sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Convidar Membro</DialogTitle>
                                    <DialogDescription>
                                        <div className="flex flex-col gap-4">
                                            <Label htmlFor="opcao_convite">
                                                Escolha como enviar o convite ao membro
                                            </Label>
                                            <RadioGroup
                                                id="opcao_convite"
                                                onValueChange={(value: string) =>
                                                    setIsModeInviteEmail(value.includes('email'))
                                                }
                                                defaultValue="email"
                                                className="text-black"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="email" id="email" />
                                                    <Label htmlFor="email">Email</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <p className="mt-4">
                                            {isModeInviteEmail ? (
                                                <>
                                                    Será enviado um email para o membro
                                                    solicitando que aceite e atualize as informações de membresia.
                                                </>
                                            ) : (
                                                <>
                                                    Será enviado um link para o WhatsApp do
                                                    membro solicitando que aceite e atualize as informações de membresia.
                                                </>
                                            )}
                                        </p>
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                    <div className="flex-1">
                                        {isModeInviteEmail ? (
                                            <EmailInput
                                                id="convite_email"
                                                onChange={(e: any) => setEmail(e.target.value)}
                                            />
                                        ) : (
                                            <PhoneInput
                                                id="convite_whatsapp"
                                                required
                                                onChange={(e: any) => setWhatsapp(e.target.value)}
                                            />
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="px-3 flex items-center gap-2"
                                        disabled={
                                            isModeInviteEmail
                                                ? email.length === 0 || !emailRegex.test(email)
                                                : whatsapp.length === 0
                                        }
                                        onClick={(e) => handleConvidarMembro(e)}
                                    >
                                        Convidar
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </section>

            <Accordion type="single" collapsible className="mb-5">
                <AccordionItem value="filters">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <Filter className="mr-2"/>
                            Filtros
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id='nome'
                                    placeholder="Nome"
                                    value={filters.nome}
                                    onChange={(e) => handleFilterChange('nome', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <InputMask
                                    id="telefone"
                                    mask="(99) 99999-9999"
                                    value={filters.telefone}
                                    onChange={(e) => handleFilterChange('telefone', e.target.value)}
                                >
                                    {(inputProps: any) => <Input
                                        placeholder={"(99) 99999-9999"} {...inputProps} />}
                                </InputMask>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diacono">É Diácono</Label>
                                <Select
                                    id="diacono"
                                    value={filters.isDiacono}
                                    onValueChange={(value) => handleFilterChange('isDiacono', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Diácono"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="true">Sim</SelectItem>
                                        <SelectItem value="false">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diacono">Status</Label>
                                <Select
                                    id="diacono"
                                    value={filters.status}
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione o status"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="ativo">{StatusEnumV2.ATIVO}</SelectItem>
                                        <SelectItem value="visitante">{StatusEnumV2.VISITANTE}</SelectItem>
                                        <SelectItem value="congregado">{StatusEnumV2.CONGREGADO}</SelectItem>
                                        <SelectItem value="inativo">{StatusEnumV2.INATIVO}</SelectItem>
                                        <SelectItem value="transferido">{StatusEnumV2.TRANSFERIDO}</SelectItem>
                                        <SelectItem value="falecido">{StatusEnumV2.FALECIDO}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hasTelefone">Tem telefone</Label>
                                <Select
                                    id="hasTelefone"
                                    value={filters.hasTelefone}
                                    onValueChange={(value) => handleFilterChange('hasTelefone', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Tem telefone"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="true">Sim</SelectItem>
                                        <SelectItem value="false">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hasTelefone">Tem email</Label>
                                <Select
                                    id="hasEmail"
                                    value={filters.hasEmail}
                                    onValueChange={(value) => handleFilterChange('hasEmail', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Tem email"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="true">Sim</SelectItem>
                                        <SelectItem value="false">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='flex justify-end items-center mt-3'>
                            <Button
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();

                                    setTimeout(() => setFilters({
                                        nome: '',
                                        telefone: '',
                                        isDiacono: 'all',
                                        status: 'all',
                                        hasEmail: 'all',
                                        hasTelefone: 'all'
                                    }), 100);

                                    setTimeout(() => applyFilters(), 200);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4"/> Limpar filtros
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                <div className="flex flex-col md:flex-row gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                disabled={selectedMembers.length === 0}
                                variant="destructive">
                                <Trash2 className="h-4 w-4 mr-3"/> Deletar Selecionados ({selectedMembers.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir: <b>({selectedMembers.length}) {selectedMembers.length === 1 ? 'membro' : 'membros'}</b>?
                                    <br/>
                                    <br/>
                                    Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSelected()}>
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                disabled={selectedMembers.length === 0}
                                variant="outline">
                                <UserCog className="mr-3 h-4 w-4"/> Solicitar Atualização Cadastral ({selectedMembers.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar solicitação de atualização cadastral</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja solicitar atualização cadastral para: <b>({selectedMembers.length}) {selectedMembers.length === 1 ? 'membro' : 'membros'}</b>?
                                    <br/>
                                    <br/>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="request-password"
                                            checked={requestPassword}
                                            onCheckedChange={(checked) => setRequestPassword(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="request-password"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Solicitar a senha na atualização cadastral
                                        </label>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRequestUpdate()}>
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/*<Button*/}
                    {/*    variant="outline"*/}
                    {/*    onClick={handleRequestUpdate}*/}
                    {/*    disabled={selectedMembers.length === 0}*/}
                    {/*>*/}
                    {/*    <UserCog className="mr-2 h-4 w-4"/> Solicitar Atualização Cadastral*/}
                    {/*</Button>*/}
                </div>
                <Button variant="outline" onClick={handleReloadTable}>
                    <RefreshCw className="mr-2 h-4 w-4"/> Recarregar
                </Button>
            </div>

            {filteredMembers.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-xl text-gray-500">Nenhum membro encontrado.</p>
                </div>
            ) : (
                <Card className="w-full">
                    <CardContent className="p-2">
                        <div className="flex flex-col sm:flex-row justify-between items-end gap-2 sm:gap-4 mb-4">
                            <div className="text-center sm:text-left">
                                <span className="font-medium">Total de membros: </span>
                                <b>{totalItemFiltered}</b>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center space-x-2 sm:space-x-2">
                                <span>Itens por página:</span>
                                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                    <SelectTrigger className="w-full sm:w-[70px]">
                                        <SelectValue placeholder={itemsPerPage} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100].map((number) => (
                                            <SelectItem key={number} value={number.toString()}>
                                                {number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>


                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Data de Nascimento</TableHead>
                                    <TableHead>Idade</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>É Diácono</TableHead>
                                    <TableHead>Ministério</TableHead>
                                    <TableHead>Diácono</TableHead>
                                    <TableHead>Última Atualização</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.map((member: FormValuesMember) => (
                                    <TableRow key={member._id} className="group">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedMembers.includes(member._id)}
                                                onCheckedChange={() => handleSelectMember(member._id)}
                                            />
                                        </TableCell>
                                        <TableCell className="relative group">
                                            {/* Imagem do membro */}
                                            <span className="block">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={member.foto} alt={member.nome}/>
                                            <AvatarFallback>{member.nome.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </span>

                                            {/* Ícone sobreposto no hover */}
                                            <div
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <ViewIcon className="w-6 h-6 text-white cursor-pointer"/>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Foto de: {member?.nome}</DialogTitle>
                                                        </DialogHeader>
                                                        <Avatar className="w-96 h-96">
                                                            <AvatarImage src={member.foto} alt={member.nome}/>
                                                            <AvatarFallback>{member.nome.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.nome}</TableCell>
                                        <TableCell>{member.dataNascimento && member.dataNascimento.length > 0 ? format(member.dataNascimento, 'dd/MM/yyyy') : ''}</TableCell>
                                        <TableCell>{member.idade}</TableCell>
                                        <TableCell>{member.telefone}</TableCell>
                                        <TableCell className="relative group">
                                            {/* Badge de status */}
                                            <span>{renderStatusBadge(member.status)}</span>

                                            {/* Botão sobreposto */}
                                            <div
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-md"
                                            >
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStatusChange(member)}
                                                            className="z-10" // Garante que o botão esteja sempre no topo
                                                        >
                                                            Alterar Status
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Alterar Status de {selectedMember?.nome}</DialogTitle>
                                                        </DialogHeader>

                                                        <Form {...form}>
                                                            <form
                                                                onSubmit={form.handleSubmit(handleStatusUpdateSubmit)}
                                                                className="space-y-4"
                                                            >
                                                                <FormField
                                                                    control={form.control}
                                                                    name="status"
                                                                    render={({field}) => (
                                                                        <FormItem>
                                                                            <FormLabel>Novo Status</FormLabel>
                                                                            <Select onValueChange={field.onChange}
                                                                                    defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue
                                                                                            placeholder="Selecione o status"/>
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

                                                                {/* STATUS ATIVO */}
                                                                {form.watch('status') === StatusEnumV2.ATIVO && (
                                                                    <>
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="ingresso.data"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Data</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input
                                                                                            type="date"
                                                                                            {...field}
                                                                                            value={
                                                                                                field.value
                                                                                                    ? new Date(field.value).toISOString().substr(0, 10)
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="ingresso.forma"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Forma</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="ingresso.local"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Local</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </>
                                                                )}

                                                                {/* STATUS TRANSFERIDO */}
                                                                {form.watch('status') === StatusEnumV2.TRANSFERIDO && (
                                                                    <>
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="transferido.data"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Data</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input
                                                                                            type="date"
                                                                                            {...field}
                                                                                            value={
                                                                                                field.value
                                                                                                    ? new Date(field.value).toISOString().substr(0, 10)
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="transferido.motivo"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Motivo</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="transferido.local"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Local</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </>
                                                                )}

                                                                {/* STATUS FALECIDO */}
                                                                {form.watch('status') === StatusEnumV2.FALECIDO && (
                                                                    <>
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="falecido.data"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Data</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input
                                                                                            type="date"
                                                                                            {...field}
                                                                                            value={
                                                                                                field.value
                                                                                                    ? new Date(field.value).toISOString().substr(0, 10)
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="falecido.motivo"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Motivo</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="falecido.local"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Local</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </>
                                                                )}

                                                                {/* STATUS EXCLUIDO */}
                                                                {form.watch('status') === StatusEnumV2.EXCLUIDO && (
                                                                    <>
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="excluido.data"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Data</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input
                                                                                            type="date"
                                                                                            {...field}
                                                                                            value={
                                                                                                field.value
                                                                                                    ? new Date(field.value).toISOString().substr(0, 10)
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="excluido.motivo"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Motivo</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </>
                                                                )}

                                                                {/* STATUS VISITANTE */}
                                                                {form.watch('status') === StatusEnumV2.VISITANTE && (
                                                                    <>
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="visitas.motivo"
                                                                            render={({field}) => (
                                                                                <FormItem>
                                                                                    <FormLabel>Motivo</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input {...field} />
                                                                                    </FormControl>
                                                                                    <FormMessage/>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </>
                                                                )}

                                                                {/* Botão de envio */}
                                                                <Button type="submit" onClick={() => {
                                                                    const result: SafeParseSuccess<any> | SafeParseError<any> = statusUpdateSchema.safeParse(form.getValues());
                                                                    console.log(form.getValues());
                                                                    console.log(result);
                                                                    const errorMessages: string[] = [];
                                                                    if (result && result.error && result.error.issues) {
                                                                        result.error.issues.forEach((errorItem: ZodIssue) => {
                                                                            errorMessages.push(errorItem.message);
                                                                        })
                                                                        alert(errorMessages);
                                                                    }
                                                                }}>Salvar Alterações</Button>
                                                            </form>
                                                        </Form>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>

                                        <TableCell>{member.role}</TableCell>
                                        <TableCell>{member.isDiacono ? 'Sim' : 'Não'}</TableCell>
                                        <TableCell>{mapMinisterios(member)}</TableCell>
                                        <TableCell>{member.diacono.nome}</TableCell>
                                        <TableCell>{format(member.updatedAt, 'dd/MM/yyyy HH:mm:ss', {locale: ptBR})}</TableCell>


                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="icon"
                                                        onClick={() => router.push(`/user?id=${member._id.toString()}`)}>
                                                    <Eye className="h-4 w-4"/>
                                                </Button>
                                                <Button variant="outline" size="icon"
                                                        onClick={() => router.push(`/member?id=${member._id.toString()}`)}>
                                                    <Edit className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-between flex-wrap items-center mt-4">
                            <div>
                                <span className="font-medium">Exibindo </span>
                                {indexOfFirstItem + 1} - {indexOfLastItem > totalItemFiltered ? totalItemFiltered : indexOfLastItem}
                                <span className="font-medium"> de {totalItemFiltered}</span>
                            </div>
                            <div className="flex justify-start flex-wrap space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage - 1)
                                        setTimeout(() => handlePageChange(currentPage - 1), 100)
                                    }}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(page)
                                            setTimeout(() => handlePageChange(page), 100)
                                        }}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage + 1)
                                        setTimeout(() => handlePageChange(currentPage + 1), 100)
                                    }}
                                    disabled={currentPage === totalPages}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

