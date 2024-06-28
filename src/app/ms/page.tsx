import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";

export default function MSPage() {
    return (
        <div className="flex flex-col min-h-[100dvh]">
            <header className="flex items-center justify-between px-4 py-2 bg-[#1976D2] text-primary-foreground">
                <div className="flex items-center gap-2">
                    <HomeIcon className="w-6 h-6" />
                    <div className="text-xl font-bold">MS AVALIAÇÕES</div>
                    <Card className="bg-primary-foreground text-primary px-3 py-1 rounded-md text-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                                <Switch id="template-toggle" className="bg-[#1976D2]" />
                                <Label htmlFor="template-toggle">Home antiga</Label>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <KeyIcon className="w-4 h-4" />
                            <span>Acesso: admin</span>
                        </div>
                    </Card>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground font-bold text-white">Filipe Firmino</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 rounded-full px-2 h-8">
                                <img src="/next.svg" alt="User Avatar" width={32} height={32} className="rounded-full" />
                                <span className="sr-only">User Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="#" prefetch={false}>
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <div className="flex-1 grid gap-6 p-6 md:grid-rows-2 lg:grid-rows-3 xl:grid-rows-4">
                <div className="bg-card rounded-lg p-4 flex flex-col gap-2 border-4 border-[#1976D2]">
                    <div className="text-lg font-medium">Gerenciamento</div>
                    <div className="grid md:grid-cols-2 gap-2">
                        <Link
                            href="#"
                            className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                            prefetch={false}
                        >
                            <LayoutGridIcon className="w-8 h-8" />
                            <div className="text-lg font-medium">Setor</div>
                            <p className="text-muted-foreground">Gerenciar setores</p>
                        </Link>
                        <Link
                            href="#"
                            className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                            prefetch={false}
                        >
                            <SlidersVerticalIcon className="w-8 h-8" />
                            <div className="text-lg font-medium">Instrumento</div>
                            <p className="text-muted-foreground">Gerenciar instrumentos de avaliação</p>
                        </Link>
                        <Link
                            href="#"
                            className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                            prefetch={false}
                        >
                            <BriefcaseIcon className="w-8 h-8" />
                            <div className="text-lg font-medium">Cargo</div>
                            <p className="text-muted-foreground">Gerenciar cargos da empresa</p>
                        </Link>
                        <Link
                            href="#"
                            className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                            prefetch={false}
                        >
                            <BuildingIcon className="w-8 h-8" />
                            <div className="text-lg font-medium">Empresa</div>
                            <p className="text-muted-foreground">Gerenciar empresas participantes</p>
                        </Link>
                        <Link
                            href="#"
                            className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                            prefetch={false}
                        >
                            <UsersIcon className="w-8 h-8" />
                            <div className="text-lg font-medium">Usuário</div>
                            <p className="text-muted-foreground">Gerenciar usuários da aplicação e seus níveis de acesso</p>
                        </Link>
                        <Link
                            href="#"
                            className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                            prefetch={false}
                        >
                            <FileIcon className="w-8 h-8" />
                            <div className="text-lg font-medium">Arquivo</div>
                            <p className="text-muted-foreground">Gerenciar arquivos cadastrados</p>
                        </Link>
                    </div>
                </div>
                <div className="bg-card rounded-lg p-4 flex flex-col gap-2 border-4 border-[#1976D2]">
                    <div className="text-lg font-medium">Avaliações & Provas</div>
                    <Link
                        href="#"
                        className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                        prefetch={false}
                    >
                        <StarIcon className="w-8 h-8" />
                        <div className="text-lg font-medium">Avaliações</div>
                        <p className="text-muted-foreground">Gerenciar avaliações</p>
                    </Link>

                    <Link
                        href="#"
                        className="flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
                        prefetch={false}
                    >
                        <ClipboardIcon className="w-8 h-8" />
                        <div className="text-lg font-medium">Provas</div>
                        <p className="text-muted-foreground">Gestão das provas</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function BriefcaseIcon(props) {
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
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
    )
}


function BuildingIcon(props) {
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
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
        </svg>
    )
}


function ClipboardIcon(props) {
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
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
    )
}


function FileIcon(props) {
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
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>
    )
}


function HomeIcon(props) {
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
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}


function KeyIcon(props) {
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
            <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
            <path d="m21 2-9.6 9.6" />
            <circle cx="7.5" cy="15.5" r="5.5" />
        </svg>
    )
}


function LayoutGridIcon(props) {
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
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    )
}


function SlidersVerticalIcon(props) {
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
            <line x1="4" x2="4" y1="21" y2="14" />
            <line x1="4" x2="4" y1="10" y2="3" />
            <line x1="12" x2="12" y1="21" y2="12" />
            <line x1="12" x2="12" y1="8" y2="3" />
            <line x1="20" x2="20" y1="21" y2="16" />
            <line x1="20" x2="20" y1="12" y2="3" />
            <line x1="2" x2="6" y1="14" y2="14" />
            <line x1="10" x2="14" y1="8" y2="8" />
            <line x1="18" x2="22" y1="16" y2="16" />
        </svg>
    )
}


function StarIcon(props) {
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}


function UsersIcon(props) {
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}