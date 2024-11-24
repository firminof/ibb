'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, Mail, Phone, MapPin, Calendar, Briefcase, Users, Heart, Home, LogIn, LogOut, Skull, Ban, Eye, Send } from 'lucide-react'
import {CivilStateEnumV2, ProvidersV2, StatusEnumV2, UserRolesV2, UserV2} from "@/lib/models/user";

// Sample data for the member
const sampleMember: UserV2 = {
    _id: '1',
    nome: 'João Silva',
    foto: '/placeholder.svg?height=100&width=100',
    cpf: '123.456.789-00',
    rg: '1234567',
    email: 'joao.silva@example.com',
    telefone: '(11) 98765-4321',
    dataNascimento: new Date('1988-03-10'),
    role: UserRolesV2.MEMBRO,
    status: StatusEnumV2.ativo,
    informacoesPessoais: {
        estadoCivil: CivilStateEnumV2.casado,
        casamento: {
            conjugue: { id: '2', nome: 'Maria Silva', isMember: true, isDiacono: false },
            dataCasamento: new Date('2015-06-20'),
        },
        filhos: [
            { id: '3', nome: 'Pedro Silva', isMember: true, isDiacono: false },
            { id: '4', nome: 'Ana Silva', isMember: true, isDiacono: false },
        ],
        temFilhos: true,
    },
    diacono: { id: '5', nome: 'Carlos Santos', isMember: true, isDiacono: true },
    ministerio: ['Louvor', 'Jovens'],
    endereco: {
        cep: '12345-678',
        rua: 'Rua das Flores',
        numero: '123',
        complemento: 'Apto 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        pais: 'Brasil',
    },
    ingresso: {
        data: new Date('2010-01-15'),
        forma: 'Batismo',
        local: 'Igreja Central',
    },
    transferencia: {
        data: null,
        motivo: null,
        local: null,
    },
    falecimento: {
        data: null,
        motivo: null,
        local: null,
    },
    exclusao: {
        data: null,
        motivo: null,
    },
    visitas: {
        motivo: null,
    },
    autenticacao: {
        providersInfo: [
            { providerId: ProvidersV2.googleCom, uid: 'google123' },
            { providerId: ProvidersV2.password, uid: 'password123' },
        ],
    },
    isDiacono: false,
}

// Sample data for sent invitations
const sampleInvitations = [
    { para: 'maria@example.com', createdAt: new Date('2023-07-01') },
    { para: 'pedro@example.com', createdAt: new Date('2023-07-05') },
    { para: 'ana@example.com', createdAt: new Date('2023-07-10') },
]

export default function UserForm() {
    const [member] = useState<UserV2>(sampleMember)
    const [invitations] = useState(sampleInvitations)

    const handleEdit = () => {
        console.log('Navigate to edit screen')
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={member.foto} alt={member.nome} />
                            <AvatarFallback>{member.nome.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{member.nome}</CardTitle>
                            <CardDescription>{member.email}</CardDescription>
                        </div>
                    </div>
                    <Button onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Badge variant={member.status === StatusEnumV2.ativo ? "default" : "secondary"}>
                            {member.status}
                        </Badge>
                        <Badge variant="outline">{member.role}</Badge>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Informações Básicas</p>
                            <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /> {member.email}</div>
                            <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /> {member.telefone}</div>
                            <div className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Nascimento: {format(member.dataNascimento, 'dd/MM/yyyy')}</div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Documentos</p>
                            <div>CPF: {member.cpf}</div>
                            <div>RG: {member.rg}</div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Informações Pessoais</p>
                        <div>Estado Civil: {member.informacoesPessoais.estadoCivil}</div>
                        {member.informacoesPessoais.casamento.conjugue && (
                            <div className="flex items-center">
                                <Heart className="mr-2 h-4 w-4" /> Cônjuge: {member.informacoesPessoais.casamento.conjugue.nome}
                                {member.informacoesPessoais.casamento.dataCasamento && (
                                    <span className="ml-2">
                    (Casamento: {format(member.informacoesPessoais.casamento.dataCasamento, 'dd/MM/yyyy')})
                  </span>
                                )}
                            </div>
                        )}
                        {member.informacoesPessoais.temFilhos && (
                            <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" /> Filhos: {member.informacoesPessoais.filhos.map(filho => filho.nome).join(', ')}
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Cargo e Ministério</p>
                        <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4" /> Diácono: {member.diacono.nome}
                        </div>
                        <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" /> Ministérios: {member.ministerio.join(', ')}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                        {member.endereco && (
                            <div className="flex items-start">
                                <MapPin className="mr-2 h-4 w-4 mt-1" />
                                <div>
                                    {member.endereco.rua}, {member.endereco.numero}
                                    {member.endereco.complemento && `, ${member.endereco.complemento}`}<br />
                                    {member.endereco.bairro}, {member.endereco.cidade} - {member.endereco.estado}<br />
                                    {member.endereco.cep}, {member.endereco.pais}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Histórico</p>
                        {member.ingresso.data && (
                            <div className="flex items-center">
                                <LogIn className="mr-2 h-4 w-4" /> Ingresso: {format(member.ingresso.data, 'dd/MM/yyyy')} - {member.ingresso.forma} ({member.ingresso.local})
                            </div>
                        )}
                        {member.transferencia.data && (
                            <div className="flex items-center">
                                <LogOut className="mr-2 h-4 w-4" /> Transferência: {format(member.transferencia.data, 'dd/MM/yyyy')} - {member.transferencia.motivo} ({member.transferencia.local})
                            </div>
                        )}
                        {member.falecimento.data && (
                            <div className="flex items-center">
                                <Skull className="mr-2 h-4 w-4" /> Falecimento: {format(member.falecimento.data, 'dd/MM/yyyy')} - {member.falecimento.motivo} ({member.falecimento.local})
                            </div>
                        )}
                        {member.exclusao.data && (
                            <div className="flex items-center">
                                <Ban className="mr-2 h-4 w-4" /> Exclusão: {format(member.exclusao.data, 'dd/MM/yyyy')} - {member.exclusao.motivo}
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Autenticação</p>
                        {member.autenticacao.providersInfo.map((provider, index) => (
                            <div key={index}>
                                Provedor: {provider.providerId}, UID: {provider.uid}
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="w-full space-y-4">
                        <h3 className="text-lg font-semibold">Convites Enviados</h3>
                        {invitations.length > 0 ? (
                            <ul className="space-y-2">
                                {invitations.map((invitation, index) => (
                                    <li key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Send className="mr-2 h-4 w-4" />
                                            <span>{invitation.para}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                      {format(invitation.createdAt, 'dd/MM/yyyy')}
                    </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhum convite enviado.</p>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

