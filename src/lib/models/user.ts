import {z} from "zod";
import {formatDateShort} from "@/lib/helpers/helpers";

export enum UserRoles {
    'ADMIN' = 'ADMIN',
    'MEMBRO' = 'MEMBRO',
}

export interface UserAddress {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
}

// VERSÃO DOIS

export enum ProvidersV2 {
    microsoftCom = 'microsoft.com',
    googleCom = 'google.com',
    password = 'password',
}

export interface FirebaseProviderInfoV2 {
    providerId: ProvidersV2;
    uid: string;
}

export interface IMember {
    id: string
    nome: string
    isMember: boolean
    isDiacono: boolean
}

export enum UserRolesV2 {
    ADMIN = 'ADMIN',
    MEMBRO = 'MEMBRO',
}

export enum StatusEnumV2 {
    VISITANTE = 'visitante',
    CONGREGADO = 'congregado',
    ATIVO = 'ativo',
    INATIVO = 'inativo',
    TRANSFERIDO = 'transferido',
    FALECIDO = 'falecido',
    EXCLUIDO = 'excluido',
}

export enum CivilStateEnumV2 {
    SOLTEIRO = 'solteiro',
    CASADO = 'casado',
    SEPARADO = 'separado',
    DIVORCIADO = 'divorciado',
    VIUVO = 'viuvo',
}

export interface UserAddressV2 {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
}

export const statusColors: Record<StatusEnumV2, string> = {
    [StatusEnumV2.VISITANTE]: 'bg-gray-200 text-gray-800',
    [StatusEnumV2.CONGREGADO]: 'bg-blue-200 text-blue-800',
    [StatusEnumV2.ATIVO]: 'bg-green-200 text-green-800',
    [StatusEnumV2.INATIVO]: 'bg-yellow-200 text-yellow-800',
    [StatusEnumV2.TRANSFERIDO]: 'bg-purple-200 text-purple-800',
    [StatusEnumV2.FALECIDO]: 'bg-red-200 text-red-800',
    [StatusEnumV2.EXCLUIDO]: 'bg-black text-white',
};

export interface Historico {
    chave: string;
    antigo: string;
    novo: string;
    updatedAt: Date;
}

export interface UserV2 {
    // Identificação na base de dados
    _id?: string;

    // Identificação Básica
    nome: string;
    foto: string;
    cpf: string;
    rg: string;
    email: string;
    telefone: string;
    dataNascimento: Date;

    // Nivel de acesso
    role: UserRolesV2;

    // Status de membresia
    status: StatusEnumV2;

    // Informações Pessoais
    informacoesPessoais: {
        estadoCivil: CivilStateEnumV2;
        casamento: {
            conjugue: IMember | null;
            dataCasamento: Date | null;
        };
        filhos: IMember[];
        temFilhos: boolean;
    };

    // Cargo e Ministério
    diacono: IMember;
    ministerio: string[];

    // Dados de Endereço
    endereco: UserAddressV2 | null;

    // Dados de Ingresso
    ingresso: {
        data: Date | null;
        forma: string | null;
        local: string | null;
    };

    // Transferência
    transferencia: {
        data: Date | null;
        motivo: string | null;
        local: string | null;
    };

    // Falecimento
    falecimento: {
        data: Date | null;
        motivo: string | null;
        local: string | null;
    };

    // Exclusão
    exclusao: {
        data: Date | null;
        motivo: string | null;
    };

    // Visitas
    visitas: {
        motivo: string | null;
    };

    // Informações de Autenticação
    autenticacao: {
        providersInfo: FirebaseProviderInfoV2[];
    };

    // Membro é diacono
    isDiacono: boolean;

    // Historico de movimentações
    historico: Historico[]
}

export const memberSchema = z.object({
    id: z.string().nullable(),
    nome: z.string().nullable(),
    isMember: z.boolean(),
    isDiacono: z.boolean(),
})

// Enum para MinisterioCategoriasEnum
export const MinisterioCategoriasEnum = z.enum(['eclesiastico', 'pessoas', 'coordenacao']); // Substitua pelas categorias reais

// Schema para MinistrieEntity
export const MinistrieEntitySchema = z.object({
    _id: z.string().optional(),
    nome: z.string(),
    categoria: MinisterioCategoriasEnum,
    responsavel: z.array(memberSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Schema para historico
export const historicoSchema = z.object({
    chave: z.string(),
    antigo: z.string(),
    novo: z.string(),
    updatedAt: z.date(),
});

export const parseDate = z
    .union([z.string(), z.date()])
    .nullable()
    .refine((val) => {
        if (!val) return true; // Permitir nulo
        if (typeof val === "string") {
            // Verificar se a string é uma data válida
            return !isNaN(new Date(val).getTime());
        }
        return val instanceof Date; // Verificar se é um objeto Date
    }, {
        message: "Data inválida",
    });

// Uso do schema
export type MinistriesEntity = z.infer<typeof MinistrieEntitySchema>;

export const formSchema = z
    .object({
        _id: z.string(),
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        foto: z.string().optional(),
        cpf: z
            .string()
            .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
        rg: z
            .string()
            .regex(/^\d{3}\.\d{3}\.\d{3}$/, "RG inválido"),
        email: z.string().email("Email inválido"),
        telefone: z
            .string()
            .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
        dataNascimento: z.date({
            message: "Data de Nascimento inválida",
        }),
        role: z.nativeEnum(UserRolesV2, {
            errorMap: () => ({
                message: "O campo 'Nível de Acesso' é obrigatório.",
            }),
        }),
        status: z.nativeEnum(StatusEnumV2, {
            errorMap: () => ({
                message: "O campo Status é obrigatório.",
            }),
        }),
        isDiacono: z.boolean({
            errorMap: () => ({
                message: "O campo se o membro é um diácono/diaconisa é obrigatório.",
            }),
        }),
        informacoesPessoais: z.object({
            estadoCivil: z.nativeEnum(CivilStateEnumV2, {
                errorMap: () => ({
                    message: "O campo Estado Civil é obrigatório.",
                }),
            }),
            casamento: z.object({
                conjugue: memberSchema.nullable(), // Permite nulo, mas será validado em `superRefine`
                dataCasamento: parseDate,
            }),
            temFilhos: z.boolean(),
            filhos: z.array(memberSchema),
        }),
        diacono: memberSchema,
        ministerio: z.array(z.string()),
        endereco: z
            .object({
                rua: z.string(),
                numero: z.string(),
                complemento: z.string().optional(),
                bairro: z.string(),
                cidade: z.string(),
                estado: z.string(),
                cep: z.string(),
            })
            .nullable(),
        ingresso: z.object({
            data: parseDate,
            forma: z.string().nullable(),
            local: z.string().nullable(),
        }),
        transferencia: z.object({
            data: parseDate,
            motivo: z.string().nullable(),
            local: z.string().nullable(),
        }),
        falecimento: z.object({
            data: parseDate,
            motivo: z.string().nullable(),
            local: z.string().nullable(),
        }),
        exclusao: z.object({
            data: parseDate,
            motivo: z.string().nullable(),
        }),
        visitas: z.object({
            motivo: z.string().nullable(),
        }),
        idade: z.number().nullable(),
        updatedAt: parseDate,
        createdAt: parseDate,
        // historico: z.array(historicoSchema).optional()
    })
    .superRefine((data, ctx) => {
        // Validação condicional para `status`
        const statusValidations = {
            ativo: () => {
                if (!data.ingresso.data || !data.ingresso.forma || !data.ingresso.local) {
                    ctx.addIssue({
                        path: ["ingresso"],
                        message: "Para membros ativos, os campos de ingresso são obrigatórios.",
                    });
                }
            },
            transferido: () => {
                if (
                    !data.transferencia.data ||
                    !data.transferencia.motivo ||
                    !data.transferencia.local
                ) {
                    ctx.addIssue({
                        path: ["transferencia"],
                        message:
                            "Para membros transferidos, os campos de transferência são obrigatórios.",
                    });
                }
            },
            falecido: () => {
                if (
                    !data.falecimento.data ||
                    !data.falecimento.motivo ||
                    !data.falecimento.local
                ) {
                    ctx.addIssue({
                        path: ["falecimento"],
                        message:
                            "Para membros falecidos, os campos de falecimento são obrigatórios.",
                    });
                }
            },
            excluido: () => {
                if (!data.exclusao.data || !data.exclusao.motivo) {
                    ctx.addIssue({
                        path: ["exclusao"],
                        message:
                            "Para membros excluídos, os campos de exclusão são obrigatórios.",
                    });
                }
            },
        };

        if (statusValidations[data.status]) {
            statusValidations[data.status]();
        }
    });

// In a real application, you would fetch this data from an API
export const dataForm: z.infer<typeof formSchema> = {
    "_id": "",
    "isDiacono": false,
    "nome": "",
    "rg": "",
    "role": UserRolesV2.MEMBRO,
    "telefone": "",
    "cpf": "",
    "email": "",
    "dataNascimento": "",
    "idade": 0,
    "foto": "",
    "diacono": {
        "nome": "",
        "isDiacono": false,
        "isMember": false,
        "id": ''
    },
    "endereco": {
        "cep": "",
        "rua": "",
        "numero": "",
        "complemento": "",
        "bairro": "",
        "cidade": "",
        "estado": "",
        "pais": ""
    },
    "status": StatusEnumV2.CONGREGADO,
    "exclusao": {
        "data": null,
        "motivo": '',
    },
    "falecimento": {
        "data": null,
        "local": '',
        "motivo": '',
    },
    "informacoesPessoais": {
        "casamento": {
            "conjugue": {
                "nome": "",
                "isDiacono": false,
                "isMember": true,
                "id": ''
            },
            "dataCasamento": null,
        },
        "estadoCivil": CivilStateEnumV2.SOLTEIRO,
        "temFilhos": false,
        "filhos": []
    },
    "ingresso": {
        "data": null,
        "forma": '',
        "local": '',
    },
    "ministerio": [],
    "transferencia": {
        "data": null,
        "local": '',
        "motivo": '',
    },
    "visitas": {
        "motivo": '',
    },
    "updatedAt": null,
    "createdAt": null,
    "historico": []
}

export type FormValuesMember = z.infer<typeof formSchema>;
export type FormValuesUniqueMember = z.infer<typeof memberSchema>;

export const formatUserV2 = (response: FormValuesMember): FormValuesMember => {
    response.foto = response.foto ? response.foto : '';
    response["historico"] = response["historico"] && response["historico"].length > 0 ? response["historico"] : [];
    response.dataNascimento = formatDateShort(response.dataNascimento);
    response.exclusao = response.exclusao.data ? formatDateShort(response.exclusao) : null;
    response.transferencia = response.transferencia.data ? formatDateShort(response.transferencia) : null;
    response.falecimento = response.falecimento.data ? formatDateShort(response.falecimento) : null;
    response.informacoesPessoais.casamento.dataCasamento = response.informacoesPessoais.casamento.dataCasamento ? formatDateShort(response.informacoesPessoais.casamento.dataCasamento) : null;
    response.exclusao = response.exclusao ? response.exclusao : {data: null, motivo: ''}
    response.falecimento = response.falecimento ? response.falecimento : {
        data: null,
        motivo: '',
        local: ''
    }
    response.ingresso = response.ingresso ? response.ingresso : {
        data: null,
        local: '',
        forma: ''
    }
    response.transferencia = response.transferencia ? response.transferencia : {
        data: null,
        motivo: '',
        local: ''
    }
    response.visitas = response.visitas ? response.visitas : {motivo: ''}

    return response;
}