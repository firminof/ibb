"use client"

import {useState} from "react"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Backdrop, CircularProgress} from "@mui/material";
import {UserCredential} from "@firebase/auth";
import {undefined} from "zod";
import Cookies from "js-cookie";
import api from "@/lib/api/api";
import {useSignInWithEmailAndPassword} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {useRouter} from "next/navigation";
import Image from "next/image";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [showErrorLogin, setShowErrorLogin] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccessLogin, setShowSuccessLogin] = useState(false);

    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();

    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    }

    const handleLogin = (e) => {
        e.preventDefault();
        setShowErrorLogin(false);

        if (email === '' && password === '') {
            setShowErrorLogin(true);
            setErrorMessage('Insira o email e senha para acessar!');
            return;
        }
        else if (email !== '' && password === '') {
            setShowErrorLogin(true);
            setErrorMessage('Insira a senha para acessar!');
            return;
        }

        else if (email === '' && password !== '') {
            setShowErrorLogin(true);
            setErrorMessage('Insira o email para acessar!');
            return;
        }

        setOpenBackLoading(true);

        try {
            signInWithEmailAndPassword(email, password)
                .then(async (result: UserCredential | undefined) => {
                    console.log(result)
                    if (!result) {
                        setShowErrorLogin(true);
                        setErrorMessage('Falha ao efetuar o login, tente novamente!');
                        return;
                    }
                    let token: string = '';

                    if (result && result.user) {
                        token = result.user['stsTokenManager']['accessToken'];

                        if (token) {
                            setShowSuccessLogin(true);
                            setTimeout(() => {
                                api.defaults.headers.Authorization = `Bearer ${token}`
                                router.push('/dashboard');
                                sessionStorage.setItem('user', JSON.stringify(result));
                            }, 1200)
                        }
                    }
                })
                .catch((error) => {
                    console.log('[PROMISE] error: ', error);
                })
                .finally(() => {
                    setOpenBackLoading(false);
                })
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
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
                    <p>Efetuando login...</p>
                </div>
            </Backdrop>
            <div className="hidden md:block md:w-1/2 lg:w-2/3">
                <div
                    className="w-full h-full bg-cover bg-center bg-black"
                    style={{ backgroundImage: "url('/ibb_tela_lateral.jpg')" }}
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
                        <h2 className="mt-16 text-start text-4xl font-bold tracking-tight">Acesse sua conta</h2>
                    </div>
                    <form className="space-y-6">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required={true}
                                placeholder='Informe seu email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                            showErrorLogin && (
                                <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                    <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <span className="sr-only">Info</span>
                                    <div>
                                        <span className="font-medium">Opss...</span> {errorMessage}
                                    </div>
                                </div>
                            )
                        }

                        {
                            showSuccessLogin && (
                                <div id="toast-success" className="fixed top-5 right-5 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                        </svg>
                                        <span className="sr-only">Check icon</span>
                                    </div>
                                    <div className="ms-3 text-sm font-normal">Login efetuado com sucesso!</div>
                                    <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
                                        <span className="sr-only">Close</span>
                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                    </button>
                                </div>
                            )
                        }

                        <Button className={`w-full ${isDarkMode ? "bg-white text-black" : "bg-black text-white"}`} onClick={(e => handleLogin(e))}>
                            Acessar
                        </Button>
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