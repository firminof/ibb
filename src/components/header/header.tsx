'use client'

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useSignOut} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {useRouter} from "next/navigation";
import Image from "next/image";
import * as React from "react";
import {useState} from "react";
import {UserRoles} from "@/lib/helpers/helpers";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {LogOutIcon, Menu, UserIcon} from "lucide-react";
import {UserApi} from "@/lib/api/user-api";
import {formatUserV2, FormValuesMember} from "@/lib/models/user";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

export function Header() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);
    const [isOpen, setIsOpen] = useState(false)

    const [signOut] = useSignOut(auth);
    const router = useRouter();
    const [photo] = useState<string>(useStoreIbbZus.photo)

    const handleSignOut = (e: any) => {
        e.preventDefault();

        try {
            signOut()
                .then(r => {
                    useStoreIbbZus.addUser(null);
                    useStoreIbbZus.addRole('');
                    useStoreIbbZus.addMongoId('');
                    useStoreIbbZus.setHasHydrated(true);
                    useStoreIbbZus.addPhoto('');

                    setTimeout(() => {
                        router.push('/login');
                    }, 1000);
                })
                .catch(e => console.log('[PROMISE] error: ', e))
        } catch (e) {
            console.log('[TRY-CATCH] error: ', e);
        }
    }

    const logoLink = useStoreIbbZus.role === UserRoles.MEMBRO ? 'https://www.ibbrooklin.org.br/' : '/dashboard'

    return (
        <header className="bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between">
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