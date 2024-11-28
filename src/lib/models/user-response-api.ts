import {IMember, IUser, StatusEnum} from "@/lib/models/user";

export interface IUserResponseApi {
    nome: string;
    cpf: string;
    rg: string;
    email: string;
    idade: number;
    telefone: string;
    foto: string;
    data_nascimento: string;
    estado_civil: string;
    conjugue: IUser | null;
    data_casamento?: string | null;
    possui_filhos: boolean;
    filhos: IUser[] | null;
    status: StatusEnum;
    diacono: IUser;
    ministerio: IMinistries[];
    role?: string;
    updatedAt: string;
    _id: string;

    transferencia: string | null;
    data_ingresso?: string | null;
    forma_ingresso?: string | null;
    local_ingresso?: string | null;

    motivo_transferencia?: string | null;

    falecimento?: string | null;
    motivo_falecimento?: string | null;

    excluido?: string | null;
    motivo_exclusao?: string | null;

    motivo_visita?: string | null;

    is_diacono: boolean;
}

export interface IMinistries {
    _id?: string;
    nome: string;
    categoria: string;
    responsavel: IMember[];
    createdAt: Date;
    updatedAt: Date;
}