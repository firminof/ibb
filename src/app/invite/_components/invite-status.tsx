import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle } from 'lucide-react'

interface InvitationInfo {
    exists: boolean
    acceptedDate?: string
    sentDate?: string
    invitedBy?: string
}

export default function InvitationStatus({ exists, acceptedDate, sentDate, invitedBy }: InvitationInfo) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {exists ? (
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-16 h-16 text-yellow-500" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        {exists ? "Convite Aceito" : "Convite Não Encontrado"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {exists ? (
                        <div className="space-y-4">
                            <p className="text-center text-gray-600">
                                O convite de membresia foi aceito anteriormente.
                            </p>
                            <div className="space-y-2">
                                <InfoItem label="Data de aceite" value={acceptedDate} />
                                <InfoItem label="Data de envio" value={sentDate} />
                                <InfoItem label="Convidado por" value={invitedBy} />
                                <InfoItem label="Status" value="Aceito" />
                            </div>
                        </div>
                    ) : (
                        <Alert variant="warning">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Atenção</AlertTitle>
                            <AlertDescription>
                                O convite que você está procurando foi excluído ou não existe mais no sistema.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function InfoItem({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div className="flex justify-between">
            <span className="font-medium text-gray-600">{label}:</span>
            <span className="text-gray-800">{value}</span>
        </div>
    )
}