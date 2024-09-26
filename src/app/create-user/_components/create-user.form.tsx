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
import {ITempUserCreate, IUser, StatusEnum, UserRoles} from "@/lib/models/user";
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
import {ToastWarning} from "@/components/toast/toast-warning";
import {UserApi} from "@/lib/api/user-api";
import {ToastSuccess} from "@/components/toast/toast-success";

export default function CreateUserForm() {
    const [isSuccessSaveMember, setIsSuccessSaveMember] = useState<boolean>(false);

    const [openBackLoading, setOpenBackLoading] = useState<boolean>(false);

    const [userForm, setUserForm] = useState<ITempUserCreate>({} as ITempUserCreate);

    const [showWarningToast, setShowWarningToast] = useState<boolean>(false);
    const [showWarningMessage, setShowWarningMessage] = useState('');

    const user = sessionStorage.getItem('user');

    const router = useRouter();

    if (user == null) {
        router.push('/login');
    }

    const ministeriosCadastrados: IMinisteriosSelect[] = ministerios.map((ministerio: IMisterios): IMinisteriosSelect => ({
        id: ministerio.id,
        label: ministerio.nome
    }));

    const diaconosCadastrados: IDiaconoSelect[] = diaconos.map((diacono: IUser): IDiaconoSelect => ({
        id: diacono.id,
        label: diacono.nome,
        value: diacono.nome
    }));

    const handleCreateUser = async () => {
        setOpenBackLoading(true);

        console.log('userForm 1: ', userForm);
        validateForm();

        try {
            userForm.role = UserRoles.MEMBRO;
            userForm.possui_filhos = userForm.possui_filhos === 'sim';

            const diacono: number = diaconosCadastrados.findIndex((diacono: IDiaconoSelect): boolean => diacono.id === Number(userForm.diacono));

            if (diacono !== -1) {
                userForm.diacono = {
                    id: diaconosCadastrados[diacono].id,
                    nome: diaconosCadastrados[diacono].label
                }
            } else {
                userForm.diacono = {
                    id: -1,
                    nome: ''
                }
            }

            // return console.log('userForm: ', userForm);
            const saveMember = await UserApi.createMember(userForm);
            setTimeout(() => {
                setOpenBackLoading(false);

                setIsSuccessSaveMember(true);

                setShowWarningMessage('');
                setShowWarningToast(false);
            }, 1000);

            setTimeout(() => router.push('members'), 1500);

        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
            setIsSuccessSaveMember(false);

            setShowWarningMessage('');
            setShowWarningToast(false);
        }
    };

    const validateForm = () => {
        if (Object.keys(userForm).length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Preencha o formulário');
            setOpenBackLoading(false);
            return;
        }

        if (!userForm.nome || userForm.nome.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo NOME está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (!userForm.cpf || userForm.cpf.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo CPF está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (!userForm.rg || userForm.rg.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo RG está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (!userForm.telefone || userForm.telefone.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo TELEFONE está vazio!');
            setOpenBackLoading(false);
            return;
        }

        const dt_nasc = new Date(userForm.data_nascimento).getTime();
        if (dt_nasc === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo DATA DE NASCIMENTO está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (!userForm.status || userForm.status.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo STATUS está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (!userForm.ministerio || userForm.ministerio.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo MINISTÉRIO está vazio!');
            setOpenBackLoading(false);
            return;
        }

        // if (!userForm.diacono) {
        //     setShowWarningToast(true);
        //     setShowWarningMessage('Campo DIÁCONO/DIACONISA está vazio!');
        //     setOpenBackLoading(false);
        //     return;
        // }

        if (!userForm.estado_civil || userForm.estado_civil.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo ESTADO CIVIL está vazio!');
            setOpenBackLoading(false);
            return;
        }

        if (userForm.status && userForm.status.length > 0) {
            switch (userForm) {
                case StatusEnum.ativo:
                    // @ts-ignore
                    if (!userForm.data_ingresso) {
                        setShowWarningToast(true);
                        setShowWarningMessage('Campo DATA DE INGRESSO está vazio!');
                        setOpenBackLoading(false);
                        return;
                    }

                    // @ts-ignore
                    if (!userForm.forma_ingresso) {
                        setShowWarningToast(true);
                        setShowWarningMessage('Campo FORMA DE INGRESSO está vazio!');
                        setOpenBackLoading(false);
                        return;
                    }

                    // @ts-ignore
                    if (!userForm.local_ingresso) {
                        setShowWarningToast(true);
                        setShowWarningMessage('Campo LOCAL DE INGRESSO está vazio!');
                        setOpenBackLoading(false);
                        return;
                    }
                    break;
            }
        }
    }

    const ministeriosSelected = (ministerios) => {
        handleCreateUserForm('ministerio', ministerios);
    }

    const handleCreateUserForm = (key: string, event: any) => {
        let fieldValue = '';

        if (key == 'status' ||
            key == 'ministerio' ||
            key == 'estado_civil' ||
            key == 'possui_filhos' ||
            key == 'diacono' ||
            key == 'forma_ingresso'
        )
            fieldValue = event;
        else
            fieldValue = event.target.value;

        setUserForm((prevState: ITempUserCreate) => ({
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
                    <p>Criando usuário...</p>
                </div>
            </Backdrop>

            {
                showWarningToast && (
                    <ToastWarning data={{message: showWarningMessage}} visible={true}
                                setShowParentComponent={setShowWarningToast}/>
                )
            }

            {
                isSuccessSaveMember && (
                    <ToastSuccess data={{message: 'Membro cadastrado com sucesso.'}} visible={true}
                                  setShowParentComponent={setIsSuccessSaveMember}/>
                )
            }

            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>
                <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Cadastro de Membro</h2>
            </section>

            <div className="space-y-6">
                <p className="text-muted-foreground flex justify-items-start items-start flex-col">Preencha os campos
                    abaixo para cadastrar um novo membro.</p>
                <Card className="w-full">
                    <CardContent className="mt-10">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className={`space-y-2`}>
                                    <Label htmlFor="nome">Nome</Label>
                                    <input
                                        id="nome"
                                        required
                                        onChange={(e: any) => handleCreateUserForm('nome', e)}
                                        placeholder="Digite o nome"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <CPFInput
                                        id="cpf"
                                        required
                                        onChange={(e: any) => handleCreateUserForm('cpf', e)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rg">RG</Label>
                                    <RGInput
                                        id="rg"
                                        required
                                        onChange={(e: any) => handleCreateUserForm('rg', e)}/>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <PhoneInput
                                        id="telefone"
                                        required
                                        onChange={(e: any) => handleCreateUserForm('telefone', e)}/>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                                        <Input
                                            id="data_nascimento"
                                            required={true}
                                            onChange={(e: any) => handleCreateUserForm('data_nascimento', e)}
                                            type="date"/>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <EmailInput
                                        id="email"
                                        required
                                        onChange={(e: any) => handleCreateUserForm('email', e)}/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 space-y-2">
                                <Label htmlFor="foto">Foto</Label>
                                {
                                    userForm && userForm.foto && userForm.foto !== '' ? (
                                        <Avatar className="w-20 h-20">
                                            <AvatarImage
                                                src={userForm && userForm.foto ? userForm.foto : 'https://github.com/shadcn.png'}/>
                                            <AvatarFallback>{obterIniciaisPrimeiroUltimo(userForm.nome)}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="foto"
                                                   className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                                <div
                                                    className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                                         aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                         fill="none"
                                                         viewBox="0 0 20 16">
                                                        <path stroke="currentColor" strokeLinecap="round"
                                                              strokeLinejoin="round" strokeWidth="2"
                                                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                    </svg>

                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                                        className="font-semibold">Clique aqui</span> ou arraste e
                                                        solte</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Extensões
                                                        de
                                                        imagens aceitas: PNG, JPG, JPEG</p>
                                                </div>
                                                <input
                                                    id="foto"
                                                    onChange={(e: any) => handleCreateUserForm('foto', e)}
                                                    type="file" className="hidden"/>
                                            </label>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select id="status"
                                            required
                                            onValueChange={(value) => handleCreateUserForm('status', value)}>
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
                                userForm.status === 'ativo' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="data_ingresso">Ingresso</Label>
                                            <Input
                                                id="data_ingresso"
                                                required
                                                onChange={(e: any) => handleCreateUserForm('data_ingresso', e)}
                                                type="date"/>
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_data_ingresso">
                                                Informe a data de ingresso na igreja
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="forma_ingresso">Forma de ingresso</Label>
                                            <Select id="forma_ingresso"
                                                    required
                                                    onValueChange={(value: string) => handleCreateUserForm('forma_ingresso', value)}>
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
                                                   onChange={(e: any) => handleCreateUserForm('local_ingresso', e)}
                                                   placeholder="Digite o local de ingresso"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                userForm.status === 'transferido' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="transferencia">Transferência</Label>
                                            <Input
                                                id="transferencia"
                                                required
                                                onChange={(e: any) => handleCreateUserForm('transferencia', e)}
                                                type="date"/>
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_transferencia">
                                                Informe a data da transferência do membro
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_transferencia">Motivo de transferência</Label>
                                            <Input id="motivo_transferencia"
                                                   onChange={(e: any) => handleCreateUserForm('motivo_transferencia', e)}
                                                   placeholder="Digite o motivo da transferência"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                userForm.status === 'falecido' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="falecimento">Falecimento</Label>
                                            <Input
                                                id="falecimento"
                                                required
                                                onChange={(e: any) => handleCreateUserForm('falecimento', e)}
                                                type="date"/>
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_falecimento">
                                                Informe a data de falecimento do membro
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_falecimento">Descrição/Motivo</Label>
                                            <Input id="motivo_falecimento"
                                                   onChange={(e: any) => handleCreateUserForm('motivo_falecimento', e)}
                                                   placeholder="Digite algo complementar do falecimento"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                userForm.status === 'excluido' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="excluido">Exclusão</Label>
                                            <Input
                                                id="excluido"
                                                required
                                                onChange={(e: any) => handleCreateUserForm('excluido', e)}
                                                type="date"/>
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_excluido">
                                                Informe a data de exclusão do membro
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_exclusao">Descrição/Motivo</Label>
                                            <Input id="motivo_exclusao"
                                                   onChange={(e: any) => handleCreateUserForm('motivo_exclusao', e)}
                                                   placeholder="Digite o motivo pela exclusão"/>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                userForm.status === 'visitante' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="motivo_visita">Descrição/Motivo</Label>
                                            <Input id="motivo_visita"
                                                   onChange={(e: any) => handleCreateUserForm('motivo_visita', e)}
                                                   placeholder="Digite brevemente quando compareceu a igreja para visitação"/>
                                        </div>
                                    </div>
                                )
                            }

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
                                <div className="space-y-2">
                                    <Label htmlFor="diacono">Diácono</Label>
                                    <Select id="diacono"
                                            required
                                            onValueChange={(value: string) => handleCreateUserForm('diacono', value)}>
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

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="estado_civil">Estado civil</Label>
                                    <Select id="estado_civil"
                                            required
                                            onValueChange={(value: string) => handleCreateUserForm('estado_civil', value)}>
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
                                    <Label htmlFor="possui_filhos">Tem filhos?</Label>
                                    <Select id="possui_filhos"
                                            required
                                            onValueChange={(value: string) => handleCreateUserForm('possui_filhos', value)}>
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
                                userForm.estado_civil === 'casado' && (
                                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="data_casamento">Data do Casamento</Label>
                                            <Input
                                                id="data_casamento"
                                                onChange={(e: any) => handleCreateUserForm('data_casamento', e)}
                                                type="date"/>
                                            <p className="mt-1 ml-1 text-sm text-gray-500 dark:text-gray-300"
                                               id="file_input_help_transferencia">
                                                Informe a data de casamento do membro (caso saiba)
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="conjugue">Nome do(a) cônjugue</Label>
                                            <Input id="conjugue"
                                                   onChange={(e: any) => handleCreateUserForm('conjugue', e)}
                                                   placeholder="Digite o nome do(a) conjugue"/>
                                        </div>
                                    </div>
                                )
                            }

                            <div className="flex flex-1 justify-end">
                                <Button type="button" onClick={() => handleCreateUser()} className="ml-auto">
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