"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function UserForm() {
    const [isEditingPersonal, setIsEditingPersonal] = useState(false)
    const [isEditingProfessional, setIsEditingProfessional] = useState(false)
    const [personalInfo, setPersonalInfo] = useState({
        name: "John Doe",
        photo: "/next.svg?height=100&width=100",
        cpf: "123.456.789-00",
        rg: "SP-12.345.567",
        email: "john.doe@example.com",
        telephone: "(11) 99999-8877",
    })
    const [professionalInfo, setProfessionalInfo] = useState({
        dateOfIngress: "02/05/2024",
        situation: "Participante",
        status: "Ativo",
        transfer: "NENHUMA",
        minister: "Ministério Teste",
    })
    const handlePersonalEdit = () => {
        setIsEditingPersonal(true)
    }
    const handlePersonalSave = () => {
        setIsEditingPersonal(false)
    }
    const handleProfessionalEdit = () => {
        setIsEditingProfessional(true)
    }
    const handleProfessionalSave = () => {
        setIsEditingProfessional(false)
    }
    return (
        <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Minhas informações</h2>
                            {isEditingPersonal ? (
                                <Button onClick={handlePersonalSave}>Save</Button>
                            ) : (
                                <Button onClick={handlePersonalEdit}>Edit</Button>
                            )}
                        </div>
                        {isEditingPersonal ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <img src="/next.svg" alt="Profile Photo" width={100} height={100} className="rounded-full" />
                                    <Input
                                        type="text"
                                        label="Nome"
                                        value={personalInfo.name}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                    />
                                </div>
                                <Input
                                    type="text"
                                    label="CPF"
                                    value={personalInfo.cpf}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, cpf: e.target.value })}
                                />
                                <Input
                                    type="text"
                                    label="RG"
                                    value={personalInfo.rg}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, rg: e.target.value })}
                                />
                                <Input
                                    type="email"
                                    label="Email"
                                    value={personalInfo.email}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                />
                                <Input
                                    type="tel"
                                    label="Telefone"
                                    value={personalInfo.telephone}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, telephone: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <img src="/next.svg" alt="Profile Photo" width={100} height={100} className="rounded-full" />
                                    <div>
                                        <div className="text-lg font-bold">{personalInfo.name}</div>
                                        <div className="text-muted-foreground">{personalInfo.email}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">CPF:</div>
                                    <div>{personalInfo.cpf}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">RG:</div>
                                    <div>{personalInfo.rg}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Telephone:</div>
                                    <div>{personalInfo.telephone}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Informações eclesiásticas</h2>
                            {isEditingProfessional ? (
                                <Button onClick={handleProfessionalSave}>Save</Button>
                            ) : (
                                <Button onClick={handleProfessionalEdit}>Edit</Button>
                            )}
                        </div>
                        {isEditingProfessional ? (
                            <div className="space-y-4">
                                <Input
                                    type="date"
                                    label="Data de ingresso"
                                    value={professionalInfo.dateOfIngress}
                                    onChange={(e) =>
                                        setProfessionalInfo({
                                            ...professionalInfo,
                                            dateOfIngress: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    type="text"
                                    label="Situação de membresia"
                                    value={professionalInfo.situation}
                                    onChange={(e) =>
                                        setProfessionalInfo({
                                            ...professionalInfo,
                                            situation: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    type="text"
                                    label="Status"
                                    value={professionalInfo.status}
                                    onChange={(e) =>
                                        setProfessionalInfo({
                                            ...professionalInfo,
                                            status: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    type="text"
                                    label="Tranferência"
                                    value={professionalInfo.transfer}
                                    onChange={(e) =>
                                        setProfessionalInfo({
                                            ...professionalInfo,
                                            transfer: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    type="text"
                                    label="Ministério"
                                    value={professionalInfo.minister}
                                    onChange={(e) =>
                                        setProfessionalInfo({
                                            ...professionalInfo,
                                            minister: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-muted-foreground">Data de ingresso:</div>
                                    <div>{professionalInfo.dateOfIngress}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Situação de membresia:</div>
                                    <div>{professionalInfo.situation}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Status:</div>
                                    <div>{professionalInfo.status}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Transferência:</div>
                                    <div>{professionalInfo.transfer}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Ministério:</div>
                                    <div>{professionalInfo.minister}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}