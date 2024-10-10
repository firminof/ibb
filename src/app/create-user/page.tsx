import CreateUserForm from "@/app/create-user/_components/create-user.form";
import {Header} from "@/components/header/header";
import {Suspense} from "react";

export default function CreateUser() {
    return (
        <Suspense>
            <Header/>
            <CreateUserForm/>
        </Suspense>
    )
}