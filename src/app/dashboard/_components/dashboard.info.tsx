'use client'

import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {SendIcon} from "@/components/send-icon/send-icon";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {ArrowRightIcon} from "@radix-ui/react-icons";
import {EmailInput, PhoneInput} from "@/components/form-inputs/form-inputs";
import {ToastSuccess} from "@/components/toast/toast-success";
import {ToastWarning} from "@/components/toast/toast-warning";
import {UserApi} from "@/lib/api/user-api";
import {IInviteByEmail} from "@/lib/models/invite";
import {emailRegex} from "@/lib/helpers/helpers";
import {UserRoles} from "@/lib/models/user";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import BirthdaysV2 from "@/app/dashboard/_components/birthdays-v2";


export function DashboardInfo() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);

    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [openDialogInvite, setOpenDialogInvite] = useState(false);
    const [isSuccessSendInvite, setIsSuccessSendInvite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModeInviteEmail, setIsModeInviteEmail] = useState(true);

    const [showWarningToast, setShowWarningToast] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState('');

    const [messageLoading, setMessageLoading] = useState('');

    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    const router = useRouter();

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

    if (useStoreIbbZus.role === UserRoles.MEMBRO) {
        router.push('/user');
    }

    if (useStoreIbbZus.user == null || useStoreIbbZus.loggout) {
        useStoreIbbZus.addUser(null);
        useStoreIbbZus.addRole('');
        useStoreIbbZus.addMongoId('');
        useStoreIbbZus.setHasHydrated(true);
        router.push('/login');
    }

    const handleExportToExcel = (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        setMessageLoading('Exportando membros para Excel');
        setOpenBackLoading(true);

        try {
            // your code here
            setTimeout(() => {
                setIsLoading(false);
                setOpenBackLoading(false);
                setMessageLoading('');
            }, 2500);
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setIsLoading(false);
            setOpenBackLoading(false);
            setMessageLoading('');
        }
    }

    const handleConvidarMembro = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        setMessageLoading(`Enviando convite ${isModeInviteEmail ? 'por email' : 'por WhatsApp'}`);
        setOpenBackLoading(true);

        try {
            if (isModeInviteEmail) {
                const validateEmail = emailRegex.test(email);

                if (!validateEmail) {
                    setShowWarningToast(true);
                    setShowWarningMessage('Email inválido, insira um corretamente!');

                    setIsLoading(false);
                    setOpenBackLoading(false);
                    setMessageLoading('');
                    setOpenDialogInvite(false);
                    setIsSuccessSendInvite(true);

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
                setShowWarningToast(false);
                setShowWarningMessage('');

                setIsLoading(false);
                setOpenBackLoading(false);
                setMessageLoading('');
                setOpenDialogInvite(false);
                setIsSuccessSendInvite(true);
                setEmail('');
                setIsModeInviteEmail(true);
                setWhatsapp('');
            }
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setIsLoading(false);
            setOpenBackLoading(false);
            setMessageLoading('');
            setOpenDialogInvite(false);
            setIsSuccessSendInvite(false);
            setEmail('');
            setIsModeInviteEmail(true);
            setWhatsapp('');
        }
    }

    return (
        <div className="flex flex-col h-full container mx-auto">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    {
                        isLoading ? <p><br/>{messageLoading}</p> : 'Carregando'
                    }
                </div>
            </Backdrop>

            {
                showWarningToast && (
                    <ToastWarning data={{message: showWarningMessage}} visible={true}
                                  setShowParentComponent={setShowWarningToast}/>
                )
            }

            <main className="flex-1 p-4 sm:p-6">
                <div
                    className="gap-3 grid sm:grid-rows-2 md:grid-cols-4 sm:flex sm:justify-end md:flex md:justify-end mb-3">
                    {/*<Button variant="outline" size="sm" className="border-2 font-bold sm:inline-flex md:inline-flex"*/}
                    {/*        onClick={(e) => handleExportToExcel(e)}>*/}
                    {/*    <DownloadIcon className="w-4 h-4 mr-1"/>*/}
                    {/*    Exportar para Excel*/}
                    {/*</Button>*/}

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
                    {
                        isSuccessSendInvite && (
                            <ToastSuccess data={{message: 'Convite enviado com sucesso!'}} visible={true}
                                          setShowParentComponent={setIsSuccessSendInvite}/>
                        )
                    }
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                            onClick={() => router.push('/member')}>
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        Adicionar Membro
                    </Button>
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                            onClick={() => router.push('/ministries')}>
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        Adicionar Ministério
                    </Button>
                </div>


                <BirthdaysV2/>
            </main>
            <footer>
                Versão: 1.2
            </footer>
        </div>
    )
}