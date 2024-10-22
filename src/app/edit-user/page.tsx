import {Header} from "@/components/header/header";
import {Suspense} from "react";
import EditUserForm from "@/app/edit-user/_components/edit-user.form";

export default function CreateUser() {
    return (
        <Suspense>
            <Header/>
            <EditUserForm/>
        </Suspense>
    )
}