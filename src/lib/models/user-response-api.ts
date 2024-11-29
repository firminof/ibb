import {IMember} from "@/lib/models/user";
import {MinisterioCategoriasEnum} from "@/app/ministries/_components/create-ministrie.form";

export interface IMinistries {
    _id?: string;
    nome: string;
    categoria: MinisterioCategoriasEnum;
    responsavel: IMember[];
    createdAt: Date;
    updatedAt: Date;
}