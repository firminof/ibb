import {NewPasswordForm} from "@/app/new-password/_components/new-password.form";
import {Suspense} from "react";

export default function NewPassword() {
    return (
        <Suspense>
            <NewPasswordForm/>
        </Suspense>
    )
}