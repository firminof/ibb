import {InviteForm} from "@/app/invite/_components/invite-form";
import {Suspense} from "react";

export default function Invite() {
    return (
        <Suspense>
            <InviteForm/>
        </Suspense>
    )
}