import {DashboardInfo} from "@/app/dashboard/_components/dashboard.info";
import {Header} from "@/components/header/header";
import {Suspense} from "react";

export default function Dashboard() {
    return (
        <Suspense>
            <Header/>
            <DashboardInfo/>
        </Suspense>
    )
}