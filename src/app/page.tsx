"use client"
import {useRouter} from "next/navigation";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import Dashboard from "@/app/dashboard/page";

export default function App() {
    const [user] = useAuthState(auth);
    const router = useRouter();

    console.log('user: ', user)
    if (!user) {
        router.push('/login');
    }

    return (
        <Dashboard/>
    );
}
