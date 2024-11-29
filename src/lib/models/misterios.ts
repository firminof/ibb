import {IMember} from "@/lib/models/user";


export interface ICreateMinisterio {
    nome: string;
    categoria: string;
    responsavel: any[] | IMember[];
}

export interface IEditMinisterio {
    nome?: string;
    categoria?: string;
    responsavel?: any[] | IMember[];
}

export interface IMinisteriosResponseApi {
    _id?: string;
    nome: string;
    categoria: string;
    responsavel: IMember[];
    createdAt: string;
    updatedAt: string;
}