'use client'

import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import {useState} from "react";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {DownloadIcon} from "@/components/download-icon/download-icon";
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
import {EmailInput} from "@/components/form-inputs/form-inputs";
import {Birthdays} from "@/app/dashboard/_components/birthdays";
import {Cards} from "@/app/dashboard/_components/cards";
import {ToastSuccess} from "@/components/toast/toast-success";
import {ToastWarning} from "@/components/toast/toast-warning";
import * as React from "react";
import {UserApi} from "@/lib/api/user-api";
import {IInviteByEmail} from "@/lib/models/invite";

export function DashboardInfo() {
    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [openDialogInvite, setOpenDialogInvite] = useState(false);
    const [isSuccessSendInvite, setIsSuccessSendInvite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [showWarningToast, setShowWarningToast] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState('');

    const [messageLoading, setMessageLoading] = useState('');

    const [email, setEmail] = useState('');

    const router = useRouter();

    const user = sessionStorage.getItem('user');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (user == null) {
        router.push('/login');
    }

    const handleExportToExcel = (e) => {
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

    const handleConvidarMembro = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessageLoading('Enviando convite por email');
        setOpenBackLoading(true);

        try {
            console.log('email: ', email);

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

            const body: IInviteByEmail = {
              to: email,
              subject: 'Convite para membresia',
              text: 'Você está sendo convidado para fazer parte da Igreja Batista do Brooklink',
              requestName: ''
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
            }
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setIsLoading(false);
            setOpenBackLoading(false);
            setMessageLoading('');
            setOpenDialogInvite(false);
            setIsSuccessSendInvite(false);
            setEmail('');
        }
    }

    return (
        <div className="flex flex-col h-full">
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
                    <Button variant="outline" size="sm" className="border-2 font-bold sm:inline-flex md:inline-flex"
                            onClick={(e) => handleExportToExcel(e)}>
                        <DownloadIcon className="w-4 h-4 mr-1"/>
                        Exportar para Excel
                    </Button>

                    <Dialog open={openDialogInvite} onOpenChange={setOpenDialogInvite}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm"
                                    className="border-2 font-bold sm:inline-flex md:inline-flex" onClick={() => setOpenDialogInvite(true)}>
                                <SendIcon className="w-4 h-4 mr-1"/>
                                Convidar Membro
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Convidar Membro</DialogTitle>
                                <DialogDescription>
                                    Será enviado um email para o membro solicitando que aceite e atualize as informações de membresia.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="link" className="sr-only">
                                        Link
                                    </Label>
                                    <EmailInput
                                        id="convite_email"
                                        onChange={(e: any) => setEmail(e.target.value)}/>
                                </div>
                                <Button type="submit" size="sm" className="px-3" disabled={email.length === 0 || !emailRegex.test(email)} onClick={(e) => handleConvidarMembro(e)}>
                                    Convidar
                                    <ArrowRightIcon className="w-4 h-4 ml-1"/>
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {
                        isSuccessSendInvite && (
                            <ToastSuccess data={{message: 'Convite enviado com sucesso!'}} visible={true} setShowParentComponent={setIsSuccessSendInvite}/>
                        )
                    }
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex"
                            onClick={() => router.push('/create-user')}>
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        Adicionar Membro
                    </Button>
                </div>

                <Cards/>

                <Birthdays/>
            </main>
        </div>
)
}