'use client'

import * as React from 'react'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Edit, Trash2} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {ChevronLeftIcon} from "@radix-ui/react-icons";
import {PlusIcon} from "@/components/plus-icon/plus-icon";
import {UserApi} from "@/lib/api/user-api";
import {IMinistries} from "@/lib/models/user-response-api";
import {Backdrop, CircularProgress} from "@mui/material";

interface Responsavel {
    id: string
    nome: string
    isMember: boolean
    isDiacono: boolean
}

interface Ministry {
    _id: string;
    nome: string;
    categoria: string;
    responsavel: Responsavel[];
    updatedAt: Date;
}

export default function MinistrieList() {
    const [ministries, setMinistries] = useState<Ministry[]>([])
    const router = useRouter();

    const [openLoading, setLoading] = useState<boolean>(false);
    const [openLoadingMessage, setLoadingMessage] = useState<string>('');

    const getAllMinistries = () => {
        try {
            UserApi.fetchMinistries()
                .then((response: IMinistries[]) => {
                    if (response && response.length > 0) {
                        setMinistries(response);
                        return;
                    }

                    setMinistries([]);
                })
                .catch((error) => {
                    console.log(error);
                    setMinistries([]);

                    switch (error.code) {
                        case 'ERR_BAD_REQUEST':
                            break;
                        case 'ERR_NETWORK':
                            break;

                        default:
                            break;
                    }
                })
                .finally(() => {

                });
        } catch (e) {
            setMinistries([]);
        }
    }
    
    useEffect(() => {
        getAllMinistries();
    }, [])

    const handleDelete = (id: string) => {
        setLoading(true);
        setLoadingMessage('Excluindo ministério...');
        
        try {
            UserApi.deleteMinisterio(id)
                .then(() => {
                    alert(`Sucesso ao excluir o ministério!`);
                })
                .catch(() => {
                    alert(`Erro ao excluir o ministério`)
                })
                .finally(() => {
                    getAllMinistries();
                    setLoading(false);
                    setLoadingMessage('');
                });
        } catch (e) {
            setLoading(false);
            setLoadingMessage('');
        }
    }

    if (openLoading) {
        return <Backdrop
            sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
            open={true}
        >
            <div className="flex flex-col items-center">
                <CircularProgress color="inherit"/>
                {openLoadingMessage}
            </div>
        </Backdrop>
    }
    
    return (
        <div className="mt-4 container mx-auto">
            <section>
                <Button variant="outline" className="text-black" onClick={() => router.back()}>
                    <ChevronLeftIcon className="h-4 w-4"/> voltar
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-black text-3xl font-semibold mb-4 mt-4">Ministérios</h2>
                    <Button size="sm" className="font-bold sm:inline-flex md:inline-flex mb-3"
                            onClick={() => router.push('/ministries')}>
                        <PlusIcon className="w-4 h-4 mr-1"/>
                        Adicionar Ministério
                    </Button>
                </div>
            </section>
            <Card className="w-full">
                <CardContent className="p-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Responsáveis</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ministries.map((ministry) => (
                                <TableRow key={ministry._id}>
                                    <TableCell>{ministry.nome}</TableCell>
                                    <TableCell>{ministry.categoria}</TableCell>
                                    <TableCell>
                                        {ministry.responsavel.map(resp => resp.nome).join(', ')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => router.push(`/ministries?id=${ministry._id}`)}
                                            >
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja excluir este ministério? Esta ação
                                                            não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(ministry._id)}>
                                                            Confirmar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

