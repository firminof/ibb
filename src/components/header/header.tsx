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

export function Header() {
    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);
    const user = useStoreIbbZus.user;

    const [signOut] = useSignOut(auth);
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

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

    return (
        <header className="bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between sm:px-6">
            <Link href={`${useStoreIbbZus.role === UserRoles.MEMBRO ? '/user' : '/dashboard'}`} prefetch={false}>
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
                                <Link href="/members" className="font-medium text-primary text-black hover:text-gray-400"
                                      prefetch={false}>
                                    Membros
                                </Link>
                                <Link href="/ministries" className="font-medium text-primary text-black hover:text-gray-400"
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
                                <img src={user && user.photoURL ? user.photoURL : '/vercel.svg'} width="32" height="32"
                                     className="rounded-full" alt="User Avatar"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 bg-background shadow-lg rounded-md right-0 sm:right-auto">
                            {/*<Link*/}
                            {/*    href="/user"*/}
                            {/*    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground"*/}
                            {/*>*/}
                            {/*    <SettingsIcon className="w-4 h-4"/>*/}
                            {/*    Minha conta*/}
                            {/*</Link>*/}
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