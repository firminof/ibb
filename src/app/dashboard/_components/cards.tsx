'use client'

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export function Cards(props: any) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Total de membros</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center sm:flex-row">
                    <div className="text-4xl font-bold">1,234</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Membros ativos</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <div className="text-4xl font-bold text-green-500">987</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Membros inativos</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <div className="text-4xl font-bold text-red-500">247</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Novos membros este mês</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">45</div>
                </CardContent>
            </Card>
        </div>
    )
}