import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {PhoneIcon} from "@/components/phone-icon/phone-icon";
import {IDiaconoSelect} from "@/lib/models/diaconos";
import {diaconos} from "@/lib/constants/diaconos";
import {IUser} from "@/lib/models/user";
import MultiSelectDropdown from "@/components/multiselect-dropdown/multiselect-dropdown";
import {IMinisteriosSelect, IMisterios} from "@/lib/models/misterios";
import {ministerios} from "@/lib/constants/misterios";

export function Birthdays(props) {
    const ministeriosCadastrados: IMinisteriosSelect[] = ministerios.map((ministerio: IMisterios): IMinisteriosSelect => ({
        id: ministerio.id,
        label: ministerio.nome
    }));

    const diaconosCadastrados: IDiaconoSelect[] = diaconos.map((diacono: IUser): IDiaconoSelect => ({
        id: diacono.id,
        label: diacono.nome,
        value: diacono.nome
    }));

    const ministeriosSelected = (ministerios) => {
        // handleCreateUserForm('ministerio', ministerios)
        // console.log('mini: ', ministerios);
    }

    return (
        <div className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Aniversariantes do mês: AGOSTO</CardTitle>
                    <div className="mb-4 gap-4 grid sm:grid-cols-1 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="name-filter">Filtrar por nome</Label>
                            <Input
                                id="name-filter"
                                className="mt-2"
                                placeholder="Digite o nome..."/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status-filter">Filtrar por Status</Label>
                            <Select>
                                <SelectTrigger id="status-filter" aria-label="Status" className="mt-2 sm:mt-2">
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

                        <div className="space-y-2">
                            <Label htmlFor="diacono-filter">Filtrar por Diácono</Label>
                            <Select id="diacono-filter"
                                    onValueChange={(value: string) => console.log(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        diaconosCadastrados && diaconosCadastrados.length > 0 && (
                                            diaconosCadastrados.map((diacono: IDiaconoSelect) => (
                                                <SelectItem key={diacono.id}
                                                            value={diacono.value}>
                                                    {diacono.label}
                                                </SelectItem>
                                            ))
                                        )
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age-range-filter" className="md:ml-4">Filtrar por Faixa Etária</Label>
                            <Select>
                                <SelectTrigger id="age-range-filter" aria-label="Status" className="mt-2 sm:mt-2">
                                    <SelectValue placeholder="Selecionar faixa etária"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="infantil">Infantil (0-12 anos)</SelectItem>
                                    <SelectItem value="adolescente">Adolescente (13-17 anos)</SelectItem>
                                    <SelectItem value="adulto">Adulto (18-64 anos)</SelectItem>
                                    <SelectItem value="idoso">Idoso (65+ anos)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex-1">
                            <Label htmlFor="ministerio-filter">Filtrar por Ministério(s)</Label>
                            <MultiSelectDropdown
                                id="ministerio-filter"
                                dataSelected={ministeriosSelected}
                                data={ministeriosCadastrados}/>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Nome</TableHead>
                                <TableHead className="font-semibold">Aniversário</TableHead>
                                <TableHead className="font-semibold">Diácono/Diaconisa</TableHead>
                                <TableHead className="font-semibold">Idade</TableHead>
                                <TableHead className="font-semibold">Ministério(s)</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>John Doe</TableCell>
                                <TableCell>Maio 15</TableCell>
                                <TableCell>Iris</TableCell>
                                <TableCell>42 Anos</TableCell>
                                <TableCell>Familiar</TableCell>
                                <TableCell>
                                    <div
                                        className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Ativo
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
                                <TableCell>Iris</TableCell>
                                <TableCell>42 Anos</TableCell>
                                <TableCell>Familiar</TableCell>
                                <TableCell>
                                    <div
                                        className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Inativo
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
                                <TableCell>Iris</TableCell>
                                <TableCell>42 Anos</TableCell>
                                <TableCell>Familiar</TableCell>
                                <TableCell>
                                    <div
                                        className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Transferido
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
    )
}