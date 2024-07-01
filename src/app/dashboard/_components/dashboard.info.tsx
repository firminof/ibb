'use client'

import Link from "next/link"
import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card"
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from "@/components/ui/table"
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useSignOut} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import {useState} from "react";

export function DashboardInfo() {
    const [openBackLoading, setOpenBackLoading] = useState(false);

    const [signOut] = useSignOut(auth);
    const router = useRouter();

    const handleSignOut = (e) => {
        e.preventDefault();

        setOpenBackLoading(true);
        try {
            signOut()
                .then(r => {
                    sessionStorage.removeItem('user');

                    setTimeout(() => {
                        router.push('/login')
                    }, 1000);
                })
                .catch(e => console.log('error: ', e))
                .finally(() => setOpenBackLoading(false))
        } catch (e) {
            console.log('error: ', e);
            setOpenBackLoading(false)
        }

    }

    return (
        <div className="flex flex-col h-full">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            <header
                className="bg-background border-b border-border px-4 py-3 flex items-center justify-between sm:px-6">
                <div className="text-4xl font-bold">IBB</div>
                <nav className="flex items-center gap-4">
                    <Link href="#" className="font-medium text-primary" prefetch={false}>
                        Membros
                    </Link>
                    <Link href="#" className="text-muted-foreground" prefetch={false}>
                        Configurações
                    </Link>
                </nav>
                <div className="relative">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <img src="/vercel.svg" width="32" height="32" className="rounded-full"
                                     alt="User Avatar"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 bg-background shadow-lg rounded-md">
                            <Link
                                href="#"
                                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground"
                                prefetch={false}
                            >
                                <SettingsIcon className="w-4 h-4"/>
                                Minha conta
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground"
                                prefetch={false}
                                onClick={(e) => handleSignOut(e)}
                            >
                                <LogOutIcon className="w-4 h-4"/>
                                Sair
                            </Link>
                        </PopoverContent>
                    </Popover>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total de membros</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <div className="text-4xl font-bold">1,234</div>
                            <div className="flex justify-end justify-items-center flex-row gap-3">
                                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                                    <DownloadIcon className="w-4 h-4"/>
                                    Exportar para Excel
                                </Button>
                                <Button size="sm" className="hidden md:inline-flex">
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
                            <CardTitle>Aniversariantes do mês: JUNHO</CardTitle>
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
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="transferido">Transferido</SelectItem>
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

function LogOutIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
    )
}


function PhoneIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
    )
}


function SettingsIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    )
}

function DownloadIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
        </svg>
    )
}

function PlusIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
        </svg>
    )
}