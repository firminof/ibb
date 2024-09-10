'use client'

import Link from "next/link";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {useSignOut} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {useRouter} from "next/navigation";
import {LoggoutIcon} from "@/components/loggout-icon/loggout-icon";
import {SettingsIcon} from "@/components/settings-icon/settings-icon";
import {useAuthState} from "react-firebase-hooks/auth";
import Image from "next/image";
import {useState} from "react";

export function Header() {
    const [signOut] = useSignOut(auth);
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [user] = useAuthState(auth);

    const handleSignOut = (e) => {
        e.preventDefault();

        try {
            signOut()
                .then(r => {
                    sessionStorage.removeItem('user');

                    setTimeout(() => {
                        router.push('/login')
                    }, 1000);
                })
                .catch(e => console.log('[PROMISE] error: ', e))
        } catch (e) {
            console.log('[TRY-CATCH] error: ', e);
        }

    }

    return (
        <header className="bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between sm:px-6">
            <Link href="/dashboard" prefetch={false}>
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
                    <Link href="/members" className="font-medium text-primary text-black hover:text-gray-400" prefetch={false}>
                        Membros
                    </Link>
                    <Link href="#" className="font-medium text-primary text-black hover:text-gray-400" prefetch={false}>
                        Ministérios
                    </Link>
                </nav>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <img src={user && user.photoURL ? user.photoURL : '/vercel.svg'} width="32" height="32" className="rounded-full" alt="User Avatar"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 bg-background shadow-lg rounded-md right-0 sm:right-auto">
                            <Link
                                href="#"
                                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground"
                                prefetch={false}
                            >
                                <SettingsIcon className="w-4 h-4"/>
                                Minha conta
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