export interface IUser {
    id: number;
    nome: string;
}

export enum UserRoles {
    'ADMIN' = 'ADMIN',
    'MEMBRO' = 'MEMBRO',
}

export enum StatusEnum {
    'visitante' = 'visitante',
    'congregado' = 'congregado',
    'ativo' = 'ativo',
    'inativo' = 'inativo',
    'transferido' = 'transferido',
    'falecido' = 'falecido',
    'excluido' = 'excluido',
}

export enum EstadoCivilEnum {
    'solteiro' = 'solteiro',
    'casado' = 'casado',
    'separado' = 'separado',
    'divorciado' = 'divorciado',
    'viuvo' = 'viuvo',
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

export interface ITempUserCreate {
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
    possui_filhos: string | boolean;
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
}

export interface ITempUserUpdate {
    _id?: string;
    role?: UserRoles;
    nome?: string;
    cpf?: string;
    rg?: string;
    email?: string;
    telefone?: string;
    foto?: string;
    data_nascimento?: Date;
    estado_civil?: EstadoCivilEnum;
    conjugue?: IUser;
    data_casamento?: Date;
    possui_filhos?: string | boolean;
    filhos?: IUser[];
    status?: StatusEnum;
    transferencia?: Date | null;
    diacono?: IUser;
    ministerio?: number[];
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
}