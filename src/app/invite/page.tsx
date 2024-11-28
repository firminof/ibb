import {Suspense} from "react";
import InviteV2Form from "@/app/invite/_components/invite-v2-form";
import Image from "next/image";

export default function Invite() {
    return (
        <Suspense>
            <header className="bg-background border-b-2 border-border px-4 py-3 flex items-center justify-between sm:px-6">
                <Image
                    src="/ibb_azul.png"
                    alt="Login background"
                    className="object-cover"
                    width="256"
                    height="128"
                />
            </header>
            <InviteV2Form/>
        </Suspense>
    )
}