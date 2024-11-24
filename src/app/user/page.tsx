import {Header} from "@/components/header/header";
import {Suspense} from "react";
import UserForm from "@/app/user/_components/user.form";

export default function User() {
    return (
        <Suspense>
            <Header/>
            <UserForm/>
        </Suspense>
    )
}