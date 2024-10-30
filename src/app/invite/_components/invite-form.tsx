'use client'

import * as React from "react";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {IMinisteriosSelect, IMisterios} from "@/lib/models/misterios";
import {ministerios} from "@/lib/constants/misterios";
import {Backdrop, CircularProgress} from "@mui/material";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {CPFInput, EmailInput, PhoneInput, RGInput} from "@/components/form-inputs/form-inputs";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {formatDateUS, obterIniciaisPrimeiroUltimo} from "@/lib/helpers/helpers";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {ToastSuccess} from "@/components/toast/toast-success";
import {ITempInvite} from "@/lib/models/invite";
import {StatusEnum, UserRoles} from "@/lib/models/user";
import {UserApi} from "@/lib/api/user-api";
import {AxiosResponse} from "axios";
import {ToastWarning} from "@/components/toast/toast-warning";

export function InviteForm(props: any) {
    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [isSuccessSaveInvite, setIsSuccessSaveInvite] = useState(false);

    const [showWarningToast, setShowWarningToast] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState('');

    const [userForm, setUserForm] = useState<ITempInvite>({} as ITempInvite);

    const router = useRouter();
    const searchParams = useSearchParams()

    const ministeriosCadastrados: IMinisteriosSelect[] = ministerios.map((ministerio: IMisterios): IMinisteriosSelect => ({
        id: ministerio.id,
        label: ministerio.nome
    }));

    const handleInviteCreateUser = async (e: any) => {
        e.preventDefault();
        setOpenBackLoading(true);

        userForm.status = StatusEnum.congregado;

        validateForm();

        try {
            userForm.role = UserRoles.MEMBRO;
            userForm.possui_filhos = Boolean(userForm.possui_filhos);
            userForm.data_nascimento = formatDateUS(userForm.data_nascimento);

            userForm.login = {
                password: '12345678'
            };

            console.log('userForm: ', userForm)

            await UserApi.createMemberByInvite(userForm);
            setIsSuccessSaveInvite(true);
            setShowWarningToast(false);
            setShowWarningMessage('');

            setOpenBackLoading(false);
            setTimeout(() => {
                router.push('/user');
            }, 1000);

        } catch (error: any) {
            setIsSuccessSaveInvite(false);

            setShowWarningToast(false);
            setShowWarningMessage('');

            setOpenBackLoading(false);
            console.log('[TRY-CATCH] error: ', error);
            const fields: any[] = [];

            if (error && error['response'] && error['response']['data'] && error['response']['data']['statusCode'] === 400) {
                if (error['response']['data']['message'] && typeof error['response']['data']['message'] === "string") {
                    switch (error['response']['data']['message']) {
                        case 'Status inválido!':
                            break;

                        case 'Estado civil inválido!':
                            break;
                        case 'Email já em uso!':
                            setShowWarningMessage('Email já em uso, tente com outro.');
                            break;
                        default:
                            setShowWarningMessage(`Erro na requisição: ${error['response']['data']['message']}`);
                            break;
                    }
                } else {
                    error['response']['data']['message'].forEach((message: string) => {
                        switch (message) {
                            case "nome should not be empty":
                                fields.push('NOME');
                                break;

                            case "cpf should not be empty":
                                fields.push('CPF');
                                break;

                            case "rg should not be empty":
                                fields.push('RG');
                                break;

                            case "telefone should not be empty":
                                fields.push('TELEFONE');
                                break;

                            case "data_nascimento should not be empty":
                                fields.push('DATA DE NASCIMENTO');
                                break;

                            case "estado_civil should not be empty":
                                fields.push('ESTADO CIVIL');
                                break;
                            default:
                                setShowWarningMessage(`Erro na requisição: ${error['response']['data']['message']}`);
                                break;
                        }
                    });

                    setShowWarningMessage(`${fields.length === 1 ? 'O campo ' + fields.join('') + ' está vazio!' : 'Os campos ' + fields.join(', ') + ' estão vazios!'}`);
                }
            } else {
                setShowWarningMessage(`Erro na requisição, tente novamente`);
            }
            setOpenBackLoading(false);
            setTimeout(() => setShowWarningToast(true), 500);
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

        if (!userForm.estado_civil || userForm.estado_civil.length === 0) {
            setShowWarningToast(true);
            setShowWarningMessage('Campo ESTADO CIVIL está vazio!');
            setOpenBackLoading(false);
            return;
        }
    }

    const ministeriosSelected = (ministerios: any) => {
        handleCreateUserForm('ministerio', ministerios)
    }

    const handleCreateUserForm = (key: string, event: any) => {
        let fieldValue = '';

        if (key == 'status' ||
            key == 'ministerio' ||
            key == 'estado_civil' ||
            key == 'possui_filhos'
        )
            fieldValue = event;
        else
            fieldValue = event.target.value;

        setUserForm((prevState) => ({
            ...prevState,
            [key]: fieldValue
        }));
    }

    useEffect(() => {
        const emailParam = searchParams.get('email') ?? '';
        const telefoneParam = searchParams.get('telefone') ?? '';

        if (emailParam.length > 0) {
            setUserForm((prevState: ITempInvite) => ({
                ...prevState,
                'email': emailParam,
            }));
        }

        if (telefoneParam.length > 0) {
            setUserForm((prevState: ITempInvite) => ({
                ...prevState,
                'telefone': telefoneParam,
            }));
        }
    }, [searchParams]);

    return (
        <div className="container mx-auto mt-4">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    <p>Atualizando convite...</p>
                </div>
            </Backdrop>

            {
                showWarningToast && (
                    <ToastWarning data={{message: showWarningMessage}} visible={true}
                                  setShowParentComponent={setShowWarningToast}/>
                )
            }

            <section>
                <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Solicitação de membresia</h2>
            </section>

            {
                isSuccessSaveInvite && (
                    <ToastSuccess data={{message: 'Membro cadastrado com sucesso.'}} visible={true}
                                  setShowParentComponent={setIsSuccessSaveInvite}/>
                )
            }

            <div className="space-y-6">
                <p className="text-muted-foreground flex justify-items-start items-start flex-col">Preencha os campos
                    abaixo para se cadastrar como novo membro após o envio do convite.</p>

                <Card className="w-full">
                    <CardContent className="mt-10">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input id="nome"
                                           value={userForm && userForm.nome ? userForm.nome : ''}
                                           onChange={(e: any) => handleCreateUserForm('nome', e)}
                                           placeholder="Digite o nome"/>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <CPFInput
                                        id="cpf"
                                        value={userForm && userForm.cpf ? userForm.cpf : ''}
                                        onChange={(e: any) => handleCreateUserForm('cpf', e)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rg">RG</Label>
                                    <RGInput
                                        id="rg"
                                        value={userForm && userForm.rg ? userForm.rg : ''}
                                        onChange={(e: any) => handleCreateUserForm('rg', e)}/>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <PhoneInput
                                        id="telefone"
                                        value={userForm && userForm.telefone ? userForm.telefone : ''}
                                        onChange={(e: any) => handleCreateUserForm('telefone', e)}/>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                                        <Input
                                            id="data_nascimento"
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
                                        value={userForm && userForm.email ? userForm.email : ''}
                                        onChange={(e: any) => handleCreateUserForm('email', e)}/>
                                </div>
                            </div>

                            {/*<div className="grid grid-cols-1 gap-4 space-y-2">*/}
                            {/*    <Label htmlFor="foto">Foto</Label>*/}
                            {/*    {*/}
                            {/*        userForm && userForm.foto && userForm.foto !== '' ? (*/}
                            {/*            <Avatar className="w-20 h-20">*/}
                            {/*                <AvatarImage*/}
                            {/*                    src={userForm && userForm.foto ? userForm.foto : 'https://github.com/shadcn.png'}/>*/}
                            {/*                <AvatarFallback>{obterIniciaisPrimeiroUltimo(userForm.nome)}</AvatarFallback>*/}
                            {/*            </Avatar>*/}
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
                            {/*                        onChange={(e: any) => handleCreateUserForm('foto', e)}*/}
                            {/*                        type="file" className="hidden"/>*/}
                            {/*                </label>*/}
                            {/*            </div>*/}
                            {/*        )*/}
                            {/*    }*/}
                            {/*</div>*/}

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ministerio">Ministério</Label>
                                    <MultiSelectDropdown
                                        id="ministerio"
                                        dataSelected={ministeriosSelected}
                                        data={ministeriosCadastrados}/>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Estado civil</Label>
                                    <Select
                                            value={userForm && userForm.estado_civil ? userForm.estado_civil : ''}
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
                                    <Label>Tem filhos?</Label>
                                    <Select
                                            value={userForm && userForm.possui_filhos ? 'true' : 'false'}
                                            onValueChange={(value: string) => handleCreateUserForm('possui_filhos', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Sim</SelectItem>
                                            <SelectItem value="false">Não</SelectItem>
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
                                                Informe a data de casamento
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
                                <Button type="submit" className="ml-auto" onClick={(e) => handleInviteCreateUser(e)}>
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