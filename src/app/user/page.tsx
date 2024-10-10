import {UserForm} from "@/app/user/_components/user.form";
import {Header} from "@/components/header/header";
import {Suspense} from "react";

export default function User() {
    return (
        <Suspense>
            <Header/>
            <UserForm/>
        </Suspense>
    )
}