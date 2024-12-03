import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, KeyIcon } from 'lucide-react'

interface PasswordSectionProps {
    password: string;
    setPassword: (password: string) => void;
    confirmPassword: string;
    setConfirmPassword: (password: string) => void;
}

export function PasswordSection({ password, setPassword, confirmPassword, setConfirmPassword }: PasswordSectionProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    const validatePassword = (pass: string) => {
        const newErrors: string[] = []
        if (pass.length < 8) newErrors.push('A senha deve ter pelo menos 8 caracteres.')
        if (!/[A-Z]/.test(pass)) newErrors.push('A senha deve conter pelo menos uma letra maiúscula.')
        if (!/[a-z]/.test(pass)) newErrors.push('A senha deve conter pelo menos uma letra minúscula.')
        if (!/[0-9]/.test(pass)) newErrors.push('A senha deve conter pelo menos um número.')
        if (!/[!@#$%^&*]/.test(pass)) newErrors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*).')
        setErrors(newErrors)
        return newErrors.length === 0
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value
        setPassword(newPassword)
        validatePassword(newPassword)
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value)
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyIcon className="w-5 h-5"/>
                    Senha
                </CardTitle>
                <CardDescription>Cadastre sua senha de acesso à plataforma</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={handlePasswordChange}
                            className="pr-10"
                            placeholder="Digite sua senha"
                        />
                        <button
                            type="button"
                            onClick={toggleShowPassword}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                            {showPassword ? (
                                <EyeOffIcon className="h-5 w-5 text-gray-400"/>
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400"/>
                            )}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirme a Senha *</Label>
                    <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder="Confirme sua senha"
                    />
                </div>
                {errors.length > 0 && (
                    <ul className="text-sm text-red-500 list-disc list-inside">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                )}
                {password !== confirmPassword && confirmPassword !== '' && (
                    <p className="text-sm text-red-500">As senhas não coincidem.</p>
                )}
            </CardContent>
        </Card>
    )
}

