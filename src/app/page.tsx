"use client"
import Dashboard from "@/app/dashboard/page";
import {useRouter} from "next/navigation";
import {getContextAuth} from "@/lib/helpers/helpers";

export default function App() {
    const router = useRouter();
    const contextAuth = getContextAuth();

    if (contextAuth.user == null) {
        router.push('/login');
    }

    return (
        <Dashboard/>
    );
}
