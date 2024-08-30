export interface IUser {
    id: number;
    nome: string;
}

export interface ITempUserCreate {
    nome: string;
    cpf: string;
    rg: string;
    email: string;
    telefone: string;
    foto: string;
    data_nascimento: Date;
    estado_civil: boolean;
    conjugue: IUser;
    data_casamento?: Date;
    possui_filhos: boolean;
    filhos: IUser;
    status: string;
    transferencia: Date;
    diacono: IUser;
    ministerio: number[];
}