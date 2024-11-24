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

// VERSÃO DOIS
export interface UserAddressV2 {
    cep: string;
    rua: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
}

export enum UserRolesV2 {
    ADMIN = 'ADMIN',
    MEMBRO = 'MEMBRO',
}

export enum StatusEnumV2 {
    visitante = 'visitante',
    congregado = 'congregado',
    ativo = 'ativo',
    inativo = 'inativo',
    transferido = 'transferido',
    falecido = 'falecido',
    excluido = 'excluido',
}

export enum CivilStateEnumV2 {
    solteiro = 'solteiro',
    casado = 'casado',
    separado = 'separado',
    divorciado = 'divorciado',
    viuvo = 'viuvo',
}

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
    id: string;
    nome: string;
    isMember: boolean;
    isDiacono: boolean;
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
}