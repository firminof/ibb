'use client'

import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import {useState} from "react";
import {PhoneIcon} from "@/components/phone-icon/phone-icon";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {DownloadIcon} from "@/components/download-icon/download-icon";

export function DashboardInfo() {
    const [openBackLoading, setOpenBackLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const router = useRouter();

    const user = sessionStorage.getItem('user');

    if (user == null) {
        router.push('/login');
    }

    const handleExportToExcel = (e) => {
        e.preventDefault();
        setIsExporting(true);
        setOpenBackLoading(true);

        try {
            // your code here
            setTimeout(() => {
                setIsExporting(false);
                setOpenBackLoading(false);
            }, 2500);
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setIsExporting(false);
            setOpenBackLoading(false);
        }
    }
    return (
        <div className="flex flex-col h-full">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    {
                        isExporting ? <p><br/>Exportando membros para Excel</p> : ''
                    }
                </div>
            </Backdrop>

            <main className="flex-1 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total de membros</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <div className="text-4xl font-bold">1,234</div>
                            <div className="flex justify-end justify-items-center flex-row gap-3">
                                <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={(e) => handleExportToExcel(e)}>
                                    <DownloadIcon className="w-4 h-4"/>
                                    Exportar para Excel
                                </Button>
                                <Button size="sm" className="hidden md:inline-flex" onClick={() => router.push('/create-user')}>
                                    <PlusIcon className="w-4 h-4"/>
                                    Adicionar Membro
                                </Button>
                            </div>
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
                </div>
                <div className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Novos membros este mês</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">45</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aniversariantes do mês: AGOSTO</CardTitle>
                            <div className="mb-4 flex space-x-4">
                                <div className="flex-1">
                                    <Label htmlFor="name-filter">Filtrar por nome</Label>
                                    <Input id="name-filter" placeholder="Digite o nome..."/>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="status-filter">Filtrar por Status</Label>
                                    <Select>
                                        <SelectTrigger id="status-filter" aria-label="Status">
                                            <SelectValue placeholder="Selecionar status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="visitante">Visitante</SelectItem>
                                            <SelectItem value="congregado">Congregado</SelectItem>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="transferido">Transferido</SelectItem>
                                            <SelectItem value="falecido">Falecido</SelectItem>
                                            <SelectItem value="excluido">Excluído</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Aniversário</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>John Doe</TableCell>
                                        <TableCell>Maio 15</TableCell>
                                        <TableCell>
                                            <div className="px-2 py-1 rounded-full bg-green-100 text-green-700">Ativo
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href="#"
                                                target="_blank"
                                                className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                prefetch={false}
                                            >
                                                <PhoneIcon className="w-4 h-4"/>
                                                Enviar Mensagem
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Jane Smith</TableCell>
                                        <TableCell>Junho 3</TableCell>
                                        <TableCell>
                                            <div
                                                className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Inativo
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href="#"
                                                target="_blank"
                                                className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                prefetch={false}
                                            >
                                                <PhoneIcon className="w-4 h-4"/>
                                                Enviar Mensagem
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Bob Johnson</TableCell>
                                        <TableCell>Julho 21</TableCell>
                                        <TableCell>
                                            <div
                                                className="px-2 py-1 rounded-full bg-red-100 text-red-700">Transferido
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href="#"
                                                target="_blank"
                                                className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                prefetch={false}
                                            >
                                                <PhoneIcon className="w-4 h-4"/>
                                                Enviar Mensagem
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}