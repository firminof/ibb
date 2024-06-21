'use client'

import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter} from "@/components/ui/card";

export default function CreateUserForm() {
    return (
        <div className="container mx-auto max-w-2xl py-12">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Cadastro de Membro</h1>
                    <p className="text-muted-foreground">Preencha os campos abaixo para cadastrar um novo membro.</p>
                </div>
                <Card>
                    <CardContent className="mt-10">
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input id="nome" placeholder="Digite o nome"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <Input id="cpf" placeholder="Digite o CPF"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rg">RG</Label>
                                    <Input id="rg" placeholder="Digite o RG"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input id="telefone" placeholder="Digite o telefone"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="foto">Foto</Label>
                                    <Input id="foto" type="file"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data-ingresso">Data de Ingresso</Label>
                                    <Input id="data-ingresso" type="date"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="situacao-membresia">Situação de Membresia</Label>
                                    <Input id="situacao-membresia" placeholder="Digite a situação"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Selecione o status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="pendente">Pendente</SelectItem>
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
                                    <Input id="ministerio" placeholder="Digite o ministério"/>
                                </div>
                            </div>
                            <CardFooter>
                                <Button type="submit" className="ml-auto">
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}