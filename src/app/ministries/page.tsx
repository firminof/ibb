import {Header} from "@/components/header/header";
import CreateMinistrieForm from "@/app/ministries/_components/create-ministrie.form";
import {Suspense} from "react";

export default function CreateUser() {
    return (
        <Suspense>
            <Header/>
            <CreateMinistrieForm/>
        </Suspense>
    )
}