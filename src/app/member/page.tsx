import {Header} from "@/components/header/header";
import {Suspense} from "react";
import MemberCreateUpdateForm from "@/app/member/_components/member-create-update.form";

export default function Member() {
    return (
        <Suspense>
            <Header/>
            <MemberCreateUpdateForm/>
        </Suspense>
    )
}