"use client"
import Dashboard from "@/app/dashboard/page";
import {useRouter} from "next/navigation";
import {IStore, useStoreIbb} from "@/lib/store/StoreIbb";

export default function App() {
    const router = useRouter();

    const useStoreIbbZus: IStore = useStoreIbb((state: IStore) => state);

    if (useStoreIbbZus.user == null) {
        router.push('/login');
    }

    return (
        <Dashboard/>
    );
}
