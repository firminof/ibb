"use client"
import Dashboard from "@/app/dashboard/page";
import {useRouter} from "next/navigation";

export default function App() {
    const router = useRouter();
    const user = sessionStorage.getItem('user');

    if (user == null) {
        router.push('/login');
    }

    return (
        <Dashboard/>
    );
}
