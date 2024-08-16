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

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();

    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    }

    const handleLogin = (e) => {
        e.preventDefault();
        setOpenBackLoading(true);

        try {
            signInWithEmailAndPassword(email, password)
                .then(async (result: UserCredential | undefined) => {
                    let token: string = '';

                    if (result && result.user) {
                        token = result.user['stsTokenManager']['accessToken'];

                        if (token) {
                            api.defaults.headers.Authorization = `Bearer ${token}`
                            router.push('/dashboard');
                            sessionStorage.setItem('user', JSON.stringify(result));
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
                    style={{ backgroundImage: "url('/ibb_circulo.png')" }}
                ></div>
                {/*<img*/}
                {/*    src="/ibb_circulo.png"*/}
                {/*    alt="Login background"*/}
                {/*    className="w-full h-full object-cover"*/}
                {/*/>*/}
            </div>
            <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 md:px-8 lg:w-1/3">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-start text-4xl font-bold tracking-tight">Acesse sua conta</h2>
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

                        <Button className="w-full" onClick={(e => handleLogin(e))}>
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