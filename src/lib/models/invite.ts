import {EstadoCivilEnum, StatusEnum, UserAddress, UserRoles} from "@/lib/models/user";

export interface IUser {
    id: number;
    nome: string;
}

export interface ITempInvite {
    _id?: string;
    role: UserRoles;
    nome: string;
    cpf: string;
    rg: string;
    email: string;
    telefone: string;
    foto?: string;
    data_nascimento: Date;
    estado_civil: EstadoCivilEnum;
    conjugue?: IUser;
    data_casamento?: Date;
    possui_filhos: boolean;
    filhos: IUser[];
    status: StatusEnum;
    transferencia: Date | null;
    diacono: IUser;
    ministerio: number[];
    endereco?: UserAddress;

    data_ingresso?: Date | null;
    forma_ingresso?: string;
    local_ingresso?: string;

    motivo_transferencia?: string;

    falecimento?: Date | null;
    motivo_falecimento?: string;

    excluido?: Date | null;
    motivo_exclusao?: string;

    motivo_visita?: string;

    login: {
        password: string;
    }
}

export interface IInviteByEmail {
    requestName: string;
    to: string;
    subject: string;
    text: string;
    phone: string;
}

export interface IInviteEntity {
    _id: string;
    memberIdRequested: string;
    requestName: string;
    to: string | null;
    phone: string | null;
    isAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;
}