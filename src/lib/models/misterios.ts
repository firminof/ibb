import {IUser} from "@/lib/models/user";

export interface IMisterios {
    id: number;
    nome: string;
    categoria: string;
    responsavel: IUser;
}

export interface IMinisteriosSelect {
    id: number | string;
    label: string;
}

export interface ICreateMinisterio {
    nome: string;
    categoria: string;
    responsavel: any[] | IUser[];
}