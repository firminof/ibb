import {CustomErrorPage} from "@/app/error/_components/custom-error-page";
import {Suspense} from "react";


export default function ErrorPage() {
    return (
        <Suspense>
            <CustomErrorPage/>
        </Suspense>
    )
}