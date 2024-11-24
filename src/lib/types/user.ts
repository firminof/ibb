import {IMember, StatusEnumV2, UserRolesV2} from "@/lib/models/user";

export interface MemberTableData {
    _id: string;
    nome: string;
    status: StatusEnumV2;
    role: UserRolesV2;
    updatedAt: Date;
    dataNascimento: Date;
    ministerio: string[];
    diacono: IMember;
    idade: number;
    cpf: string;
    rg: string;
    telefone: string;
    email: string;
    isDiacono: boolean;
}