import {Suspense} from "react";
import InviteV2Form from "@/app/invite/_components/invite-v2-form";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

export default function Invite() {
    return (
        <Suspense>
            <header className="bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between sm:px-6">
                <Link href={'https://www.ibbrooklin.org.br/'} prefetch={false} className="flex-shrink-0">
                    <Image
                        src="/ibb_logo.PNG"
                        alt="IBB Logo"
                        width={256}
                        height={100}
                        className="object-contain"
                    />
                </Link>
            </header>
            <InviteV2Form/>
        </Suspense>
    )
}