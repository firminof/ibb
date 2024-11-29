import {IMember} from "@/lib/models/user";

export interface IMinistries {
    _id?: string;
    nome: string;
    categoria: string;
    responsavel: IMember[];
    createdAt: Date;
    updatedAt: Date;
}