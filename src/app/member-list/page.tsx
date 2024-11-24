import {Suspense} from "react";
import {Header} from "@/components/header/header";
import MemberListing from "@/app/member-list/_components/member-listining";

export default function MemberList() {
    return (
        <Suspense>
            <Header/>
            <MemberListing/>
        </Suspense>
    )
}