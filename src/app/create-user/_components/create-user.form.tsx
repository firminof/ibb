'use client'

import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import {Backdrop, CircularProgress} from "@mui/material";
import {useState} from "react";
import api from "@/lib/api/api";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";

export default function CreateUserForm() {
    const [openBackLoading, setOpenBackLoading] = useState(false);

    const user = sessionStorage.getItem('user');

    const router = useRouter();

    if (user == null) {
        router.push('/login');
    }

    const ministeriosCadastrados = [
        {id: 1, label: 'Option 1'},
        {id: 2, label: 'Option 2'},
        {id: 3, label: 'Option 3'},
        {id: 4, label: 'Option 4'},
        {id: 5, label: 'Option 5'},
        {id: 6, label: 'Option 6'},
        {id: 7, label: 'Option 7'},
        {id: 8, label: 'Option 8'},
        {id: 9, label: 'Option 9'},
        {id: 10, label: 'Option 10'},
    ];

    const handleCreateUser = (e) => {
        e.preventDefault();
        setOpenBackLoading(true);

        try {
            // your code here
            console.log(api.defaults.headers.Authorization)
            setTimeout(() => {
                setOpenBackLoading(false);
            }, 1000);
        } catch (error) {
            console.log('[TRY-CATCH] error: ', error);
            setOpenBackLoading(false);
        }
    };

    const ministeriosSelected = (ministerios) => {
        console.log('mini: ', ministerios);
    }

    return (
        <div className="container mx-auto max-w-2xl py-12">
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackLoading}
            >
                <div className="flex flex-col items-center">
                    <CircularProgress color="inherit"/>
                    <p>Criando usuário...</p>
                </div>
            </Backdrop>
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Cadastro de Membro</h1>
                    <p className="text-muted-foreground">Preencha os campos abaixo para cadastrar um novo membro.</p>
                </div>
                <Card className="w-full">
                    <CardContent className="mt-10">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input id="nome" placeholder="Digite o nome"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <Input id="cpf" placeholder="Digite o CPF"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rg">RG</Label>
                                    <Input id="rg" placeholder="Digite o RG"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input id="telefone" placeholder="Digite o telefone"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="foto">Foto</Label>
                                    <Input id="foto" type="file"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data-ingresso">Data de Ingresso</Label>
                                    <Input id="data-ingresso" type="date"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Selecione o status"/>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="transferencia">Transferência</Label>
                                    <Input id="transferencia" placeholder="Digite a transferência"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ministerio">Ministério</Label>
                                    {/*<Input id="ministerio" placeholder="Digite o ministério"/>*/}
                                    <MultiSelectDropdown dataSelected={ministeriosSelected} data={ministeriosCadastrados}/>
                                </div>
                            </div>
                            <div className="flex flex-1 justify-end">
                                <Button type="submit" className="ml-auto" onClick={(e) => handleCreateUser(e)}>
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}