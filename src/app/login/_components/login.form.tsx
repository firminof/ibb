"use client"

import * as React from "react"
import {useState} from "react"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Backdrop, CircularProgress} from "@mui/material";
import api from "@/lib/api/api";
import {useSignInWithEmailAndPassword} from "react-firebase-hooks/auth";
import {auth, RecaptchaVerifier} from "@/app/firebase/config";
import Image from "next/image";
import {ToastSuccess} from "@/components/toast/toast-success";
import {UserApi} from "@/lib/api/user-api";
import {useRouter} from "next/navigation";
import {emailRegex} from "@/lib/helpers/helpers";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {EmailInput} from "@/components/form-inputs/form-inputs";
import {ArrowRightIcon} from "@radix-ui/react-icons";
import {formatUserV2, FormValuesMember, UserRoles} from "@/lib/models/user";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {signInWithPhoneNumber} from "@firebase/auth";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";


export function LoginForm() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);

    const [email, setEmail] = useState("");
    const [emailForgotPass, setEmailForgotPass] = useState("");

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showFieldPassword, setShowFieldPassword] = useState(false);

    const [showErrorLogin, setShowErrorLogin] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [showSuccessLogin, setShowSuccess] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState('');

    const [showDialogForgotPass, setShowDialogForgotPass] = useState(false);

    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

    const router = useRouter();

    const [openBackLoading, setOpenBackLoading] = useState<boolean>(false);
    const [openBackLoadingMessage, setOpenBackLoadingMessage] = useState<string>('');

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loginByEmail, setLoginByEmail] = useState(true);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
    }

    const handleLogin = (e: any) => {
        e.preventDefault();
        setShowErrorLogin(false);

        if (email === '' && password === '') {
            setShowErrorLogin(true);
            setErrorMessage('Insira o email e senha para acessar!');
            return;
        } else if (email !== '' && password === '') {
            setShowErrorLogin(true);
            setErrorMessage('Insira a senha para acessar!');
            return;
        } else if (email === '' && password !== '') {
            setShowErrorLogin(true);
            setErrorMessage('Insira o email para acessar!');
            return;
        }

        setOpenBackLoading(true);
        setOpenBackLoadingMessage('Efetuando login...');

        try {
            signInWithEmailAndPassword(email, password)
                .then(async (result: any) => {
                    if (!result) {
                        setShowErrorLogin(true);
                        setErrorMessage('Falha ao efetuar o login, tente novamente!');
                        return;
                    }
                    let token: string = '';

                    if (result && result.user) {
                        let role = '';
                        let mongoId = '';

                        token = result.user['stsTokenManager']['accessToken'];
                        const customAttributes = result.user['reloadUserInfo']['customAttributes']

                        if (customAttributes) {
                            const getAttributes = JSON.parse(customAttributes);

                            role = getAttributes['role'];
                            mongoId = getAttributes['mongoId'];
                        }
                        if (token) {
                            setTimeout(() => {
                                api.defaults.headers.Authorization = `Bearer ${token}`;

                                const getUniqueMember = async (): Promise<void> => {
                                    try {
                                        if (useStoreIbbZus && useStoreIbbZus.mongoId.length === 24) {
                                            UserApi.fetchMemberById(useStoreIbbZus.mongoId)
                                                .then((response: FormValuesMember) => {
                                                    if (response) {
                                                        const member: FormValuesMember = formatUserV2(response);
                                                        useStoreIbbZus.addPhoto(member.foto);
                                                    }
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                    switch (error.code) {
                                                        case 'ERR_BAD_REQUEST':
                                                            useStoreIbbZus.addPhoto('');
                                                            break;
                                                        case 'ERR_NETWORK':
                                                            useStoreIbbZus.addPhoto('');
                                                            break;

                                                        default:
                                                            useStoreIbbZus.addPhoto('');
                                                            break;
                                                    }
                                                })
                                        }
                                    } catch (e) {
                                        useStoreIbbZus.addPhoto('');
                                    }
                                }

                                switch (role) {
                                    case UserRoles.ADMIN:
                                        setShowSuccess(true);
                                        setShowSuccessMessage('Login efetuado com sucesso!');

                                        useStoreIbbZus.addUser(JSON.stringify(result));
                                        useStoreIbbZus.addRole(role);
                                        useStoreIbbZus.addMongoId(mongoId);
                                        useStoreIbbZus.addSessionDuration(new Date().getTime()); // hora do login
                                        useStoreIbbZus.addLoggout(false);

                                        useStoreIbbZus.addMembros([]);
                                        useStoreIbbZus.addTotalMembros(0);
                                        useStoreIbbZus.addDiaconos([]);
                                        useStoreIbbZus.addMinisterios([]);

                                        router.push('/dashboard');
                                        break;
                                    case UserRoles.MEMBRO:
                                        setShowSuccess(true);
                                        setShowSuccessMessage('Login efetuado com sucesso!');

                                        useStoreIbbZus.addUser(JSON.stringify(result));
                                        useStoreIbbZus.addRole(role);
                                        useStoreIbbZus.addMongoId(mongoId);
                                        useStoreIbbZus.addSessionDuration(new Date().getTime()); // hora do login
                                        useStoreIbbZus.addLoggout(false);

                                        useStoreIbbZus.addMembros([]);
                                        useStoreIbbZus.addTotalMembros(0);
                                        useStoreIbbZus.addDiaconos([]);
                                        useStoreIbbZus.addMinisterios([]);

                                        router.push('/user');

                                        break;
                                    default:
                                        setShowErrorLogin(true);
                                        setErrorMessage('Membro não possuí as regras mínimas para acessar a plataforma, contate o administrador.');
                                    // router.push('/error');
                                }
                            }, 1200)
                        }
                    }
                })
                .catch((error) => {
                    console.log('[PROMISE] error: ', error);
                })
                .finally(() => {
                    setOpenBackLoading(false);
                    setOpenBackLoadingMessage('');
                })
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
            setOpenBackLoadingMessage('');
        }
    }

    const handleSeguinte = (e: any) => {
        e.preventDefault();

        setOpenBackLoading(true);
        setOpenBackLoadingMessage('Verificando email...');

        try {
            UserApi.getUserByEmail(email)
                .then((result) => {
                    if (result.emailVerified) {
                        setShowFieldPassword(true);
                        setShowErrorLogin(false);
                        setErrorMessage('');
                        return;
                    }

                    setErrorMessage('É preciso redefinir sua senha para seu primeiro acesso, foi enviado um link para seu email para redefinição de senha!');
                    setShowErrorLogin(true);

                    setTimeout(() => setEmailForgotPass(email), 500);
                    setTimeout(() => handleForgotPassword(e), 1000);
                })
                .catch((error) => {
                    console.log(error);
                    setShowFieldPassword(false);

                    setShowErrorLogin(true);
                    if (!error.response.data || error.response.data.message === '') {
                        setErrorMessage('Algo inesperado aconteceu, recarregue a página e tente novamente!');
                        return;
                    }

                    if (error.response.data.message.toString().includes('Membro não encontrado!')) {
                        setErrorMessage('Membro não cadastrado, solicite um convite para fazer parte da nossa comunidade');
                        return;
                    }

                    if (error.response.data.message.toString().includes('There is no user record corresponding to the provided identifier')) {
                        setErrorMessage('Membro não cadastrado, solicite um convite para fazer parte da nossa comunidade');
                        return;
                    }

                    setErrorMessage('Algo inesperado aconteceu, recarregue a página e tente novamente!');
                    return;
                })
                .finally(() => {
                    setOpenBackLoading(false);
                    setOpenBackLoadingMessage('');
                })
        } catch (error: any) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
            setOpenBackLoadingMessage('');
            setShowFieldPassword(false);

            setShowErrorLogin(true);

            if (error.response.data.message.toString().includes('There is no user record corresponding to the provided identifier')) {
                setErrorMessage('Membro não cadastrado, solicite um convite para fazer parte da nossa comunidade');
                return;
            }

            if (error.response.data.message.toString() === '') {
                setErrorMessage('Algo inesperado acontecer, recarregue a página e tente novamente');
                return;
            }
            setErrorMessage(error.response.data.message);
        }
    }

    const handleSendCode = async () => {
        try {
            const recaptchaVerifier = new RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "invisible",
                },
                auth
            );

            const confirmation = await signInWithPhoneNumber(
                auth,
                '+55'+phoneNumber,
                recaptchaVerifier
            );
            setConfirmationResult(confirmation);
            alert("Código de verificação enviado!");
        } catch (error) {
            console.error("Erro ao enviar código:", error);
            alert("Erro ao enviar código. Tente novamente.");
        }
    };

    const handleVerifyCode = async () => {
        try {
            const result = await confirmationResult.confirm(verificationCode);
            const user = result.user;
            alert("Login realizado com sucesso!");
            router.push("/dashboard"); // Redireciona para a página de dashboard
        } catch (error) {
            console.error("Erro ao verificar código:", error);
            alert("Código de verificação inválido.");
        }
    };

    const handleForgotPassword = (e: any) => {
        e.preventDefault();

        setOpenBackLoading(true);
        setOpenBackLoadingMessage('Enviando link de redefinição de senha...');

        try {
            UserApi.getUserByEmailResetPassword(emailForgotPass === '' ? email : emailForgotPass)
                .then((result) => {
                    setShowSuccess(true);
                    setShowSuccessMessage('Link enviado com sucesso, verifique sua Caixa de Entrada!');

                    setShowErrorLogin(false);
                    setErrorMessage('');

                    setTimeout(() => setShowFieldPassword(false), 500);
                })
                .catch((error) => {
                    console.log(error);

                    setShowErrorLogin(true);

                    if (error.response.data.message.includes('Cannot GET /v1/auth/reset-password/')) {
                        setErrorMessage('Não foi possível enviar o email de recuperação, tente novamente conferindo o email informado!');
                        return;
                    }
                    setErrorMessage(error.response.data.message);
                })
                .finally(() => {
                    setOpenBackLoading(false);
                    setOpenBackLoadingMessage('');

                    setShowDialogForgotPass(false);
                    setEmailForgotPass('');
                })
        } catch (error: any) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
            setOpenBackLoadingMessage('');

            setShowErrorLogin(true);
            setErrorMessage(error.response.data.message);
            setEmailForgotPass('');
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
                    style={{backgroundImage: "url('/ibb_login.jpg')"}}
                ></div>
            </div>
            <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 md:px-8 lg:w-1/3">
                <div className="w-full max-w-md space-y-8">
                    {
                        !isDarkMode && (
                            <div className="flex flex-col items-center justify-center -mt-12">
                                <div>
                                    <Image
                                        src="/ibb_logo_circulo.png"
                                        alt="Login background"
                                        className={`object-cover rounded-3xl`}
                                        width="152"
                                        height="88"
                                    />
                                </div>
                            </div>
                        )
                    }

                    {
                        loginByEmail ? (
                            <>
                                <div>
                                    <h2 className="mt-16 text-start text-4xl font-bold tracking-tight">Acesse sua
                                        conta</h2>
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

                                    {
                                        showFieldPassword && email.length > 0 && (
                                            <div className="flex-col gap-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Senha</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Entre com a senha"
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

                                                <div className="flex justify-end items-center">
                                                    <Dialog open={showDialogForgotPass}
                                                            onOpenChange={setShowDialogForgotPass}>
                                                        <DialogTrigger asChild>
                                                <span className="font-normal hover:text-zinc-500 hover:cursor-pointer"
                                                      onClick={() => setShowDialogForgotPass(true)}>Esqueci a senha</span>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>Esqueci a senha</DialogTitle>
                                                                <DialogDescription>
                                                                    Será enviado um email com o link de redefinição da sua
                                                                    senha.
                                                                </DialogDescription>
                                                                <DialogDescription>
                                                                    Em alguns casos o email pode estar na Caixa de Spam ou
                                                                    Lixo
                                                                    Eletronico.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="grid flex-1 gap-2">
                                                                    <Label htmlFor="esqueci_senha_email"
                                                                           className="sr-only">
                                                                        Link
                                                                    </Label>
                                                                    <EmailInput
                                                                        id="esqueci_senha_email"
                                                                        onChange={(e: any) => setEmailForgotPass(e.target.value)}/>
                                                                </div>
                                                                <Button type="submit" size="sm" className="px-3"
                                                                        disabled={emailForgotPass.length === 0 || !emailRegex.test(emailForgotPass)}
                                                                        onClick={(e) => handleForgotPassword(e)}>
                                                                    Enviar
                                                                    <ArrowRightIcon className="w-4 h-4 ml-1"/>
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        showErrorLogin && (
                                            <div
                                                className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                                                role="alert">
                                                <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true"
                                                     xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                                     viewBox="0 0 20 20">
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

                                    {
                                        showSuccessLogin && (
                                            <ToastSuccess data={{message: showSuccessMessage}} visible={true}
                                                          setShowParentComponent={setShowSuccess}/>
                                        )
                                    }

                                    {
                                        showFieldPassword && email.length > 0 ? (
                                            <Button
                                                className={`w-full ${isDarkMode ? "bg-white text-black" : "bg-black text-white"}`}
                                                onClick={(e => handleLogin(e))}>
                                                Acessar
                                            </Button>
                                        ) : (
                                            <Button
                                                className={`w-full ${isDarkMode ? "bg-white text-black" : "bg-black text-white"}`}
                                                onClick={(e => handleSeguinte(e))}>
                                                Seguinte
                                            </Button>
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
                            </>
                        ) : (
                            <Card className="w-full max-w-md mx-auto">
                                <CardHeader>
                                    <CardTitle>Verificação de Telefone</CardTitle>
                                    <CardDescription>Insira seu número de telefone para receber um código de verificação.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone-number">Número de Telefone</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="phone-number"
                                                type="tel"
                                                placeholder="(11) 99999-9999"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                            />
                                            <Button onClick={handleSendCode}>Enviar Código</Button>
                                        </div>
                                    </div>

                                    <div id="recaptcha-container"></div>

                                    <div className="space-y-2">
                                        <Label htmlFor="verification-code">Código de Verificação</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="verification-code"
                                                type="text"
                                                placeholder="Digite o código"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                            />
                                            <Button onClick={handleVerifyCode}>Verificar Código</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }

                </div>
            </div>
        </div>
    )
}

function MoonIcon(props: any) {
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

function EyeOffIcon(props: any) {
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

function SunIcon(props: any) {
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