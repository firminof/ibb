'use client'

import Link from "next/link";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {useSignOut} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {useRouter} from "next/navigation";
import {LoggoutIcon} from "@/components/loggout-icon/loggout-icon";
import Image from "next/image";
import {useState} from "react";
import {UserRoles} from "@/lib/helpers/helpers";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";
import {UserIcon} from "lucide-react";
import {UserApi} from "@/lib/api/user-api";
import {formatUserV2, FormValuesMember} from "@/lib/models/user";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import * as React from "react";

export function Header() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);
    const user = useStoreIbbZus.user;

    const [signOut] = useSignOut(auth);
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [photo, setPhoto] = useState<string>('')

    const handleSignOut = (e: any) => {
        e.preventDefault();

        try {
            signOut()
                .then(r => {
                    useStoreIbbZus.addUser(null);
                    useStoreIbbZus.addRole('');
                    useStoreIbbZus.addMongoId('');
                    useStoreIbbZus.setHasHydrated(true);

                    setTimeout(() => {
                        router.push('/login');
                    }, 1000);
                })
                .catch(e => console.log('[PROMISE] error: ', e))
        } catch (e) {
            console.log('[TRY-CATCH] error: ', e);
        }
    }

    const getUniqueMember = async (): Promise<void> => {
        try {
            if (useStoreIbbZus && useStoreIbbZus.mongoId.length === 24) {
                UserApi.fetchMemberById(useStoreIbbZus.mongoId)
                    .then((response: FormValuesMember) => {
                        if (response) {
                            const member: FormValuesMember = formatUserV2(response);
                            setPhoto(member.foto);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        switch (error.code) {
                            case 'ERR_BAD_REQUEST':
                                setPhoto('');
                                break;
                            case 'ERR_NETWORK':
                                setPhoto('');
                                break;

                            default:
                                setPhoto('');
                                break;
                        }
                    })
            }
        } catch (e) {
            setPhoto('');
        }
    }

    getUniqueMember();

    return (
        <header className="bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between sm:px-6">
            <Link href={`${useStoreIbbZus.role === UserRoles.MEMBRO ? 'https://www.ibbrooklin.org.br/' : '/dashboard'}`} prefetch={false}>
                <div>
                    <Image
                        src="/ibb_azul.png"
                        alt="Login background"
                        className="object-cover"
                        width="256"
                        height="128"
                    />
                </div>
            </Link>

            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                {
                    useStoreIbbZus.role === UserRoles.ADMIN && (
                        <div>
                            <div className="sm:hidden">
                                <button
                                    type="button"
                                    className="text-black hover:text-gray-400 focus:outline-none"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Navigation Menu */}
                            <nav
                                className={`${
                                    menuOpen ? "block" : "hidden"
                                } sm:flex items-center gap-4`}
                            >
                                <Link href="/member-list" className="font-medium text-primary text-black hover:text-gray-400"
                                      prefetch={false}>
                                    Membros
                                </Link>
                                <Link href="/ministrie-list" className="font-medium text-primary text-black hover:text-gray-400"
                                      prefetch={false}>
                                    Ministérios
                                </Link>
                            </nav>
                        </div>
                    )
                }

                {/* User Profile Dropdown */}
                <div className="relative">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={photo} alt={'Foto do membro'}/>
                                    <AvatarFallback>{'IBB'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 bg-background shadow-lg rounded-md right-0 sm:right-auto">
                            <Link
                                href={`/user?id=${useStoreIbbZus.mongoId}`}
                                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground"
                            >
                                <UserIcon className="w-4 h-4"/>
                                Meu perfil
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground"
                                prefetch={false}
                                onClick={(e) => handleSignOut(e)}
                            >
                                <LoggoutIcon className="w-4 h-4"/>
                                Sair
                            </Link>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </header>
    )
}