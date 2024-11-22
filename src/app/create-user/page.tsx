import {Header} from "@/components/header/header";
import {Suspense} from "react";
import MemberForm from "@/app/create-user/_components/member.form";

export default function CreateUser() {
    return (
        <Suspense>
            <Header/>
            <MemberForm/>
        </Suspense>
    )
}