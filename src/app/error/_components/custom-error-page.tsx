"use client"

import {Button} from "@/components/ui/button";
import {AlertTriangle} from "lucide-react"
import {useRouter} from "next/navigation";

interface ErrorPageProps {
    statusCode?: number
    title?: string
    message?: string
}

export function CustomErrorPage({
                                    title = "Algo deu errado.",
                                    message = "Pedimos desculpas, mais estamos enfrentando uma instabilidade. Tente novamente depois.",
                                }: ErrorPageProps = {}) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400"/>
                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                    {title}
                </h1>
                <p className="mt-4 text-gray-600">{message}</p>
                <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
                    <Button
                        onClick={() => router.push('/login')}
                    >
                        Voltar para o login
                    </Button>
                </div>
                <p className="mt-8 text-sm text-gray-500">
                    Se o problema persistir, por favor faça contato com o administrador.
                </p>
            </div>
        </div>
    )
}