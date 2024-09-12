'use client'

import {useEffect, useState} from "react";
import {useRouter, useSearchParams } from "next/navigation";
import {IMinisteriosSelect, IMisterios} from "@/lib/models/misterios";
import {ministerios} from "@/lib/constants/misterios";
import api from "@/lib/api/api";
import {Backdrop, CircularProgress} from "@mui/material";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {CPFInput, EmailInput, PhoneInput, RGInput} from "@/components/form-inputs/form-inputs";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {obterIniciaisPrimeiroUltimo} from "@/lib/helpers/helpers";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {ToastSuccess} from "@/components/toast/toast-success";
import {ITempInvite} from "@/lib/models/invite";

export function InviteForm(props) {
    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [isSuccessSaveInvite, setIsSuccessSaveInvite] = useState(false);

    const [userForm, setUserForm] = useState<ITempInvite>({} as ITempInvite);

    const user = sessionStorage.getItem('user');

    const router = useRouter();
    const searchParams = useSearchParams()

    if (user == null) {
        router.push('/login');
    }

    const ministeriosCadastrados: IMinisteriosSelect[] = ministerios.map((ministerio: IMisterios): IMinisteriosSelect => ({
        id: ministerio.id,
        label: ministerio.nome
    }));

    const handleInviteCreateUser = (e) => {
        e.preventDefault();
        setOpenBackLoading(true);

        console.log('userForm: ', userForm)
        try {
            // your code here
            console.log(api.defaults.headers.Authorization)
            setTimeout(() => {
                setOpenBackLoading(false);
                setIsSuccessSaveInvite(true);
            }, 1000);
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
        }
    };

    const ministeriosSelected = (ministerios) => {
        // handleCreateUserForm('ministerio', ministerios)
        // console.log('mini: ', ministerios);
    }

    const handleCreateUserForm = (key: string, event: any) => {
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

        setUserForm((prevState) => ({
            ...prevState,
            [key]: fieldValue
        }));
    }

    useEffect(() => {
        const emailParam =  searchParams.get('email') ?? '';

        if (emailParam.length > 0) {
            console.log('emailParam ', emailParam);
            setUserForm((prevState) => ({
                ...prevState,
                'email': emailParam
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

            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>
                <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Solicitação de membresia</h2>
            </section>

            {
                isSuccessSaveInvite && (
                    <ToastSuccess data={{message: 'Membro cadastrado com sucesso.'}} visible={true} setShowParentComponent={setIsSuccessSaveInvite}/>
                )
            }

            <div className="space-y-6">
                <p className="text-muted-foreground flex justify-items-start items-start flex-col">Preencha os campos abaixo para se cadastrar como novo membro após o envio do convite.</p>

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
                                    <Label htmlFor="estado_civil">Estado civil</Label>
                                    <Select id="estado_civil"
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
                                    <Label htmlFor="possui_filhos">Tem filhos?</Label>
                                    <Select id="possui_filhos"
                                            value={userForm && userForm.possui_filhos ? userForm.possui_filhos : ''}
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
                                                   value={userForm && userForm.conjugue && userForm.conjugue.nome ? userForm.conjugue.nome : ''}
                                                   onChange={(e: any) => handleCreateUserForm('conjugue', e)}
                                                   placeholder="Digite o nome do(a) conjugue"/>
                                        </div>
                                    </div>
                                )
                            }

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ministerio">Ministério</Label>
                                    <MultiSelectDropdown
                                        id="ministerio"
                                        dataSelected={ministeriosSelected}
                                        data={ministeriosCadastrados}/>
                                </div>
                            </div>

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