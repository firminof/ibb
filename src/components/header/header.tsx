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

export function Header() {
    const [signOut] = useSignOut(auth);
    const router = useRouter();

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
        <header
            className="bg-background border-b border-border px-4 py-3 flex items-center justify-between sm:px-6">

            <Link href="/dashboard" prefetch={false}>
                <div className="text-4xl font-bold">IBB</div>
            </Link>

            <nav className="flex items-center gap-4">
                <Link href="/user" className="font-medium text-primary" prefetch={false}>
                    Membros
                </Link>
            </nav>
            <div className="relative">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <img src={user && user.photoURL ? user.photoURL : '/vercel.svg'} width="32" height="32" className="rounded-full"
                                 alt="User Avatar"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 bg-background shadow-lg rounded-md">
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
        </header>
    )
}