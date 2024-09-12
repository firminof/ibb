export interface IUser {
    id: number;
    nome: string;
}

export interface ITempInvite {
    nome: string;
    cpf: string;
    rg: string;
    email: string;
    telefone: string;
    foto: string;
    data_nascimento: Date;
    estado_civil: string;
    conjugue: IUser;
    data_casamento?: Date;
    possui_filhos: string;
    filhos: IUser;
    ministerio: number[];
}