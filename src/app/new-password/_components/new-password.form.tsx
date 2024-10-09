"use client"

import {useState} from "react"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Backdrop, CircularProgress} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";
import {ToastSuccess} from "@/components/toast/toast-success";
import {getEmailStorage} from "@/lib/helpers/helpers";
import {useUpdatePassword} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";

import {confirmPasswordReset} from 'firebase/auth';
import { useLocation } from 'react-router-dom';
import * as React from "react";

export function NewPasswordForm() {
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccessLogin, setShowSuccessLogin] = useState(false);

    const [updatePassword] = useUpdatePassword(auth);

    const router = useRouter();

    const [openBackLoading, setOpenBackLoading] = useState<boolean>(false);
    const [openBackLoadingMessage, setOpenBackLoadingMessage] = useState<string>('');

    const [isDarkMode, setIsDarkMode] = useState(false);

    const searchParams = useSearchParams()

    const email = searchParams.get('email');
    const oobCode = searchParams.get('oobCode');

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    }

    const handleSavePassword = async(e: any) => {
        e.preventDefault();

        try {
            if (oobCode) {
                setOpenBackLoading(true);
                setOpenBackLoadingMessage('Salvando senha...');

                await confirmPasswordReset(auth, oobCode, newPassword);

                setShowSuccessLogin(true);

                setTimeout(() => {
                    router.push('/login')
                })
            }
        } catch (e) {
            setOpenBackLoading(false);
            setOpenBackLoadingMessage('');
            setShowSuccessLogin(false);

            setShowError(true);
            setErrorMessage('Erro ao salvar a nova senha, gere um novo link de redefinição!');
        }
    }

    return (
        <div className={`flex min-h-screen w-full ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    <p>{openBackLoadingMessage}</p>
                </div>
            </Backdrop>
            <div className="hidden md:block md:w-1/2 lg:w-2/3">
                <div
                    className="w-full h-full bg-cover bg-center bg-black"
                    style={{backgroundImage: "url('/ibb_tela_lateral.jpg')"}}
                ></div>
            </div>
            <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 md:px-8 lg:w-1/3">
                <div className="w-full max-w-md space-y-8">
                    {
                        !isDarkMode && (
                            <div className="flex flex-col items-center justify-center -mt-12">
                                <div>
                                    <Image
                                        src="/ibb_azul_v2.png"
                                        alt="Login background"
                                        className={`object-cover`}
                                        width="152"
                                        height="88"
                                    />
                                </div>
                            </div>
                        )
                    }

                    <div>
                        <h2 className="mt-16 text-start text-4xl font-bold tracking-tight">Criar nova senha</h2>
                        <span>Defina uma senha para acesso na plataforma</span>
                    </div>
                    <form className="space-y-6">

                        {
                            email && (
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        disabled={true}
                                        value={email}
                                    />
                                </div>
                            )
                        }

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Entre com a senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1/2 right-4 -translate-y-1/2"
                                    onClick={(e) => {
                                        setShowPassword(!showPassword);
                                        e.preventDefault();
                                    }}
                                >
                                    <EyeOffIcon
                                        className="h-5 w-5 text-muted-foreground dark:text-muted-foreground-dark"/>
                                </Button>
                            </div>
                        </div>

                        {
                            showError && (
                                <div
                                    className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                                    role="alert">
                                    <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <span className="sr-only">Info</span>
                                    <div>
                                        <span className="font-medium">Opss...</span> {errorMessage}
                                    </div>
                                </div>
                            )
                        }

                        <Button
                            className={`w-full ${isDarkMode ? "bg-white text-black" : "bg-black text-white"}`}
                            onClick={(e => handleSavePassword(e))}>
                            Salvar
                        </Button>

                        {
                            showSuccessLogin && (
                                <ToastSuccess data={{message: 'Senha cadastrada com sucesso!'}} visible={true}
                                              setShowParentComponent={setShowSuccessLogin}/>
                            )
                        }

                    </form>
                    <div className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleDarkMode}
                            className={`rounded-full ${
                                isDarkMode
                                    ? "bg-white-800 text-white-300 hover:bg-white-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            {isDarkMode ? <SunIcon className="h-6 w-6"/> : <MoonIcon className="h-6 w-6"/>}
                            <span className="sr-only">Modo escuro</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MoonIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
    )
}

function EyeOffIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
            <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>
    )
}

function SunIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
        </svg>
    )
}