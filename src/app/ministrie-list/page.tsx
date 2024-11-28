import {Suspense} from "react";
import {Header} from "@/components/header/header";
import MinistrieList from "@/app/ministrie-list/_components/ministrie-list";

export default function Ministries() {
    return (
        <Suspense>
            <Header/>
            <MinistrieList/>
        </Suspense>
    )
}