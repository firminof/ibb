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
import {Edit, Eye, Filter, RefreshCw, Trash, UserCog, ViewIcon} from 'lucide-react'
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
    const useStoreIbbZus = useStoreIbb((state: IStore) => state);
    const router = useRouter();

    const [ministerios, setMinisterios] = useState<MinistriesEntity[]>([]);
    const [diaconos, setDiaconos] = useState<FormValuesUniqueMember[]>([]);
    const [membros, setMembros] = useState<FormValuesMember[]>([]);

    const [openLoading, setLoading] = useState<boolean>(false);
    const [openLoadingMessage, setLoadingMessage] = useState<string>('');

    const [filteredMembers, setFilteredMembers] = useState<FormValuesMember[]>([])
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [filters, setFilters] = useState({
        nome: '',
        telefone: '',
        isDiacono: 'all',
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

    useEffect(() => {
        const filtered: FormValuesMember[] = membros.filter(member =>
            member.nome.toLowerCase().includes(filters.nome.toLowerCase()) &&
            member.telefone.includes(filters.telefone) &&
            (filters.isDiacono === 'all' || member.isDiacono.toString() === filters.isDiacono)
        )
        setFilteredMembers(filtered)
    }, [membros, filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({...prev, [key]: value}))
    }

    const handleSelectMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
        )
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
            .finally(() => {
                setLoading(false);
                setLoadingMessage('');
                getAllMembers();
                setSelectedMembers([]);
            });
    }

    const handleRequestUpdate = () => {
        setLoading(true);
        setLoadingMessage('Solicitando atualizando cadastral...');
        console.log('Requesting update for members:', selectedMembers)

        try {
            if (selectedMembers && selectedMembers.length > 0) {
                UserApi.requestUpdateUserInfo({_id: selectedMembers})
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
        fetchMembers()
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

        console.log({
            status: member.status,
            ...valorAtual
        })
        form.reset({
            status: member.status,
            ...valorAtual
        })
    }


    const handleStatusUpdateSubmit = (data: any) => {
        setLoading(true);
        setLoadingMessage('Atualizando status do membro');

        console.log("Form Data:", data);
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
                            fetchMembers();
                        })
                        .catch((error) => {
                            console.log(error);
                            switch (error.code) {
                                case 'ERR_BAD_REQUEST':
                                    setMembros([]);
                                    break;
                                case 'ERR_NETWORK':
                                    setMembros([]);
                                    break;

                                default:
                                    setMembros([]);
                                    break;
                            }
                        })
                        .finally(() => {
                            setLoading(false);
                            setLoadingMessage('');
                            form.reset();
                        })
                }
            } catch (e) {
                setLoading(false);
                setLoadingMessage('');
                form.reset();
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
        if (useStoreIbbZus.hasHydrated && useStoreIbbZus.role === UserRoles.MEMBRO) {
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


        getAllMinistries();
        getAllMembersDiaconos();
        getAllMembers();
    }

    useEffect(() => {
        setLoading(true);
        setLoadingMessage('Carregando...')
        fetchMembers();
    }, [useStoreIbbZus.hasHydrated])

    const getAllMinistries = () => {
        setLoading(true);
        setLoadingMessage('Carregando...');
        try {
            UserApi.fetchMinistries()
                .then((response: IMinistries[]) => {
                    if (response && response.length > 0) {
                        setMinisterios(response);
                        return;
                    }

                    setMinisterios([]);
                })
                .catch((error) => {
                    console.log(error);
                    setMinisterios([]);

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            break;
                        case 'ERR_NETWORK':
                            break;

                        default:
                            break;
                    }
                })
                .finally(() => {
                    setLoading(false);
                    setLoadingMessage('');
                });
        } catch (e) {
            setMinisterios([]);
            setLoading(false);
            setLoadingMessage('');
        }
    }

    const getAllMembersDiaconos = async (): Promise<void> => {
        setLoading(true);
        setLoadingMessage('Carregando...');
        try {
            UserApi.fetchMembersDiaconos()
                .then((response: FormValuesMember[]) => {
                    if (response.length > 0) {
                        const mapDiaconos: FormValuesUniqueMember[] = response.map((diacono: FormValuesMember) => (
                            {
                                "nome": diacono.nome,
                                "isDiacono": diacono.isDiacono,
                                "isMember": true,
                                "id": diacono._id.toString()
                            }
                        ))
                        setDiaconos(mapDiaconos);
                        return;
                    }

                    setDiaconos([]);
                })
                .catch((error) => {
                    console.log(error);
                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setDiaconos([]);
                            break;
                        case 'ERR_NETWORK':
                            setDiaconos([]);
                            break;

                        default:
                            setDiaconos([]);
                            break;
                    }
                })
                .finally(() => {
                    setLoading(false);
                    setLoadingMessage('');
                })
        } catch (e) {
            setDiaconos([]);
            setLoading(false);
            setLoadingMessage('');
        }
    }
    const getAllMembers = async (): Promise<void> => {
        setLoading(true);
        setLoadingMessage('Carregando...');
        try {
            UserApi.fetchMembers()
                .then((response: FormValuesMember[]) => {
                    if (response.length > 0) {
                        setMembros(response);
                        return;
                    }

                    setMembros([]);
                })
                .catch((error) => {
                    console.log(error);
                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            setMembros([]);
                            break;
                        case 'ERR_NETWORK':
                            setMembros([]);
                            break;

                        default:
                            setMembros([]);
                            break;
                    }
                })
                .finally(() => {
                    setLoading(false);
                    setLoadingMessage('');
                })
        } catch (e) {
            setMembros([]);
            setLoading(false);
            setLoadingMessage('');
        }
    }

    const mapMinisterios = (member: FormValuesMember) => {
        // Filtra os ministérios cujos _id estão no array ids e retorna os nomes correspondentes.
        return ministerios
            .filter((ministerio: MinistriesEntity) => member.ministerio.includes(ministerio._id))
            .map((ministerio: MinistriesEntity): string => ministerio.nome ? ministerio.nome : '-').join(', ');
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

    return (
        <div className="container mx-auto py-10">
            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>

                <div className="flex justify-between items-center">
                    <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Membros</h2>
                    <div className="flex justify-end items-center gap-4">
                        <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                                onClick={() => router.push('/member')}>
                            <PlusIcon className="w-4 h-4 mr-1"/>
                            Adicionar Membro
                        </Button>

                        <Dialog open={openDialogInvite} onOpenChange={setOpenDialogInvite}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm"
                                        className="border-2 font-bold sm:inline-flex md:inline-flex"
                                        onClick={() => setOpenDialogInvite(true)}>
                                    <SendIcon className="w-4 h-4 mr-1"/>
                                    Convidar Membro
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Convidar Membro</DialogTitle>
                                    <DialogDescription>
                                        <div className="flex flex-col justify-items-start space-x-2 gap-3">
                                            <Label htmlFor="opcao_convite">Escolha como enviar o convite ao membro</Label>
                                            <RadioGroup id='opcao_convite'
                                                        onValueChange={(value: string) => setIsModeInviteEmail(value.includes('email'))}
                                                        defaultValue={'email'}
                                                        className="text-black"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="email" id="email"/>
                                                    <Label htmlFor="email">Email</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="whatsapp" id="whatsapp"/>
                                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {
                                            isModeInviteEmail ? (
                                                <p className="flex mt-4">
                                                    Será enviado um email para o membro solicitando que aceite e atualize as
                                                    informações de membresia.
                                                </p>
                                            ) : (
                                                <p className="flex mt-4">
                                                    Será enviado um link para o WhatsApp do membro solicitando que aceite e
                                                    atualize as informações de membresia.
                                                </p>
                                            )
                                        }
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center space-x-2">
                                    <div className="grid flex-1 gap-2">
                                        {
                                            isModeInviteEmail ? (
                                                <EmailInput
                                                    id="convite_email"
                                                    onChange={(e: any) => setEmail(e.target.value)}/>
                                            ) : (
                                                <PhoneInput
                                                    id="convite_whatsapp"
                                                    required
                                                    onChange={(e: any) => setWhatsapp(e.target.value)}/>
                                            )
                                        }

                                    </div>
                                    <Button type="submit" size="sm" className="px-3"
                                            disabled={isModeInviteEmail ? email.length === 0 || !emailRegex.test(email) : whatsapp.length == 0}
                                            onClick={(e) => handleConvidarMembro(e)}>
                                        Convidar
                                        <ArrowRightIcon className="w-4 h-4 ml-1"/>
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
                        <div className="grid grid-cols-3 gap-4 mt-4">
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
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Diácono"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="true">Sim</SelectItem>
                                        <SelectItem value="false">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-between mb-5">
                <div className="space-x-2">
                    <Button
                        variant="destructive"
                        onClick={handleDeleteSelected}
                        disabled={selectedMembers.length === 0}
                    >
                        <Trash className="mr-2 h-4 w-4"/> Deletar Selecionados
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRequestUpdate}
                        disabled={selectedMembers.length === 0}
                    >
                        <UserCog className="mr-2 h-4 w-4"/> Solicitar Atualização Cadastral
                    </Button>
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
                                        <TableCell>{format(member.dataNascimento, 'dd/MM/yyyy')}</TableCell>
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
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

