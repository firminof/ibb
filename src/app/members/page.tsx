import {Header} from "@/components/header/header";
import {MembersList} from "@/app/members/_components/members-list";
import {Suspense} from "react";

export default function Members() {
    return (
        <Suspense>
            <Header/>
            <MembersList/>
        </Suspense>
    );
}