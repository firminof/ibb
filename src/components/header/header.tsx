'use client'

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useSignOut} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {useRouter} from "next/navigation";
import Image from "next/image";
import * as React from "react";
import {useState} from "react";
import {emailRegex, passouUmaHora, UserRoles} from "@/lib/helpers/helpers";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {LogOutIcon, Menu, UserIcon} from "lucide-react";
import {UserApi} from "@/lib/api/user-api";
import {formatUserV2, FormValuesMember} from "@/lib/models/user";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {SendIcon} from "@/components/send-icon/send-icon";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {EmailInput, PhoneInput} from "@/components/form-inputs/form-inputs";
import {ArrowRightIcon} from "@radix-ui/react-icons";

export function Header() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);
    const [isOpen, setIsOpen] = useState(false)

    const [signOut] = useSignOut(auth);
    const router = useRouter();
    const [photo] = useState<string>(useStoreIbbZus.photo)
    const [openDialogSession, setOpenDialogSession] = useState(false);

    const handleSignOut = () => {
        try {
            signOut()
                .then(r => {
                    useStoreIbbZus.addUser(null);
                    useStoreIbbZus.addRole('');
                    useStoreIbbZus.addMongoId('');
                    useStoreIbbZus.setHasHydrated(true);
                    useStoreIbbZus.addPhoto('');
                    useStoreIbbZus.addLoggout(true);
                    useStoreIbbZus.addMembros([]);
                    useStoreIbbZus.addTotalMembros(0);
                    useStoreIbbZus.addDiaconos([]);
                    useStoreIbbZus.addMinisterios([]);

                    setTimeout(() => {
                        router.push('/login');
                    }, 1000);
                })
                .catch(e => console.log('[PROMISE] error: ', e))
        } catch (e) {
            console.log('[TRY-CATCH] error: ', e);
        }
    }

    const logoLink = useStoreIbbZus.role === UserRoles.MEMBRO ? 'https://www.ibbrooklin.org.br/' : '/dashboard';

    if (!useStoreIbbZus.loggout) {
        const verificaSessaoExpirada: boolean = passouUmaHora(useStoreIbbZus.sessionDuration);

        if (verificaSessaoExpirada) {
            setTimeout(() => setOpenDialogSession(true), 1000);
        }
    }

    return (
        <header className="bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between">
            <Dialog open={openDialogSession} onOpenChange={setOpenDialogSession}>
                {/* Conteúdo do Diálogo */}
                <DialogContent className="w-full max-w-sm sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sessão encerrada</DialogTitle>
                        <DialogDescription>
                            <p>Sua sessão foi encerrada por tempo de uso.</p>
                            <p>Você será redirecionado para o login para se autenticar novamente.</p>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                            type="submit"
                            size="sm"
                            className="px-3 flex items-center gap-2"
                            onClick={(e) => handleSignOut()}
                        >
                            Ir para login
                            <ArrowRightIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Link href={logoLink} prefetch={false} className="flex-shrink-0">
                <Image
                    src="/ibb_azul.png"
                    alt="IBB Logo"
                    width={256}
                    height={100}
                    className="object-contain"
                />
            </Link>

            <div className="flex items-center gap-4">
                {useStoreIbbZus.role === UserRoles.ADMIN && (
                    <>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href="/member-list"
                                className="font-medium text-primary hover:text-primary/80 transition-colors"
                                prefetch={false}
                            >
                                Membros
                            </Link>
                            <Link
                                href="/ministrie-list"
                                className="font-medium text-primary hover:text-primary/80 transition-colors"
                                prefetch={false}
                            >
                                Ministérios
                            </Link>
                        </nav>

                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Abrir menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-4 mt-4">
                                    <Link
                                        href="/member-list"
                                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                                        prefetch={false}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Membros
                                    </Link>
                                    <Link
                                        href="/ministrie-list"
                                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                                        prefetch={false}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Ministérios
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={photo} alt="Foto do membro" />
                                <AvatarFallback>IBB</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Abrir menu de perfil</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/user?id=${useStoreIbbZus.mongoId}`}
                                className="flex items-center gap-2"
                            >
                                <UserIcon className="w-4 h-4" />
                                Meu perfil
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href="#"
                                className="flex items-center gap-2"
                                onClick={handleSignOut}
                            >
                                <LogOutIcon className="w-4 h-4" />
                                Sair
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}