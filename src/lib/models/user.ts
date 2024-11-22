export interface IUser {
    id: any;
    nome: string;
    is_membro: boolean;
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
    data_nascimento: any;
    estado_civil: EstadoCivilEnum;
    conjugue?: IUser;
    data_casamento?: any;
    possui_filhos: string | boolean;
    filhos: IUser[];
    status: StatusEnum;
    transferencia: any | null;
    diacono: IUser;
    ministerio: number[];
    endereco?: UserAddress;

    data_ingresso?: any | null;
    forma_ingresso?: string;
    local_ingresso?: string;

    motivo_transferencia?: string;
    local_transferencia?: string;

    falecimento?: any | null;
    motivo_falecimento?: string;

    excluido?: any | null;
    motivo_exclusao?: string;

    motivo_visita?: string;

    is_diacono: boolean | string;
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
    data_nascimento?: any;
    estado_civil?: EstadoCivilEnum;
    conjugue?: IUser;
    data_casamento?: any;
    possui_filhos?: string | boolean;
    filhos?: IUser[];
    status?: StatusEnum;
    transferencia?: any | null;
    diacono?: IUser;
    ministerio?: number[];
    endereco?: UserAddress;

    data_ingresso?: any | null;
    forma_ingresso?: string;
    local_ingresso?: string;

    motivo_transferencia?: string;
    local_transferencia?: string;

    falecimento?: any | null;
    motivo_falecimento?: string;

    excluido?: any | null;
    motivo_exclusao?: string;

    motivo_visita?: string;

    is_diacono?: boolean;
}