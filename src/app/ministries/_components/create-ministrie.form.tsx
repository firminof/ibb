'use client'

import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {ministerios} from "@/lib/constants/misterios";
import {IMinisteriosSelect, IMisterios} from "@/lib/models/misterios";
import {ITempUserCreate, IUser} from "@/lib/models/user";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {obterIniciaisPrimeiroUltimo} from "@/lib/helpers/helpers";
import {diaconos} from "@/lib/constants/diaconos";
import {IDiaconoSelect} from "@/lib/models/diaconos";
import {CPFInput, EmailInput, PhoneInput, RGInput} from "@/components/form-inputs/form-inputs";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {ToastError} from "@/components/toast/toast-error";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const formSchema = z.object({
    nome: z.string({required_error: 'NOME é obrigatório'}),
    cpf: z.string({required_error: 'CPF é obrigatório'}),
    rg: z.string({required_error: 'RG é obrigatório'}),
    telefone: z.string({required_error: 'TELEFONE é obrigatório'}),
    data_nascimento: z.date({required_error: 'DATA DE NASCIMENTO é obrigatório'}),
    email: z.string({required_error: 'EMAIL é obrigatório'}),
    status: z.string({required_error: 'STATUS é obrigatório'}),
    diacono: z.string({required_error: 'DIÁCONO/DIACONISA é obrigatório'}),
    ministerio: z.number({required_error: 'MINISTÉRIO(S) é obrigatório'}),
    estado_civil: z.string({required_error: 'ESTADO CIVIL é obrigatório'}),
    foto: z.string(),
})

type MemberSchema = z.infer<typeof formSchema>;

export default function CreateMinistrieForm() {
    const {handleSubmit} = useForm<MemberSchema>({
        mode: "onBlur",
        resolver: zodResolver(formSchema)
    });

    const [openBackLoading, setOpenBackLoading] = useState(false);

    const [ministrieForm, setMinistrieForm] = useState<ITempUserCreate>({} as ITempUserCreate);

    const [showWarningToast, setShowWarningToast] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState('');

    const user = sessionStorage.getItem('user');

    const router = useRouter();

    if (user == null) {
        router.push('/login');
    }

    const diaconosCadastrados: IDiaconoSelect[] = diaconos.map((diacono: IUser): IDiaconoSelect => ({
        id: diacono.id,
        label: diacono.nome,
        value: diacono.nome
    }));

    const handleCreateMinistrie = async () => {
        setOpenBackLoading(true);

        console.log('ministrieForm 1: ', ministrieForm);
        validateForm();

        try {
            return console.log('ministrieForm: ', ministrieForm);
            // const saveMember = await UserApi.createMember(ministrieForm);
            // console.log(saveMember);
            setTimeout(() => {
                setOpenBackLoading(false);
            }, 1000);
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
        }
    };

    const validateForm = () => {
        if (Object.keys(ministrieForm).length === 0) {
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

        if (ministrieForm && ministrieForm.diacono.nome.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo DIÁCONO/DIACONISA está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (ministrieForm && ministrieForm.estado_civil.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo ESTADO CIVIL está vazio!');
            setOpenBackLoading(false);
            return;
        }
    }

    const handleCreateMinistrieForm = (key: string, event: any) => {
        let fieldValue = '';

        if (key == 'status' ||
            key == 'ministerio' ||
            key == 'estado_civil' ||
            key == 'possui_filhos' ||
            key == 'diacono'
        )
            fieldValue = event;
        else
            fieldValue = event.target.value;

        setMinistrieForm((prevState) => ({
            ...prevState,
            [key]: fieldValue
        }));
    }

    return (
        <div className="container mx-auto mt-4">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    <p>Criando ministério...</p>
                </div>
            </Backdrop>

            {
                showWarningToast && (
                    <ToastError data={{message: showWarningMessage}} visible={true}
                                setShowParentComponent={setShowWarningToast}/>
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

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                                <div className="space-y-2">
                                    <Label htmlFor="diacono">Diácono</Label>
                                    <Select id="diacono"
                                            required
                                            onValueChange={(value: string) => handleCreateMinistrieForm('diacono', value)}>
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