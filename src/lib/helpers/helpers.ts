import {IMesAtual} from "@/lib/models/mes-atual";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {UserApi} from "@/lib/api/user-api";
import {format} from "date-fns";

let emailStorage = '';

export const obterIniciaisPrimeiroUltimo = (nomeCompleto: string) => {
    if (nomeCompleto && nomeCompleto.length > 0) {
        const partes = nomeCompleto.split(' ');
        const primeiroNome = partes[0][0].toUpperCase();
        let ultimoNome = '';
        if (partes.length >= 2) {
            if (partes && partes[partes.length - 1][0]) {
                ultimoNome = partes[partes.length - 1][0].toUpperCase();
            }
        }
        return primeiroNome + ultimoNome;
    }
    return 'IBB'
}

export const obterMesAtual = (): IMesAtual => {
    const date: Date = new Date();

    const month: number = date.getMonth() + 1;

    // return {codigo: 7, descricao: 'Julho'}
    switch (month) {
        case 1:
            return {codigo: 1, descricao: 'Janeiro'};
        case 2:
            return {codigo: 2, descricao: 'Fevereiro'};
        case 3:
            return {codigo: 3, descricao: 'Março'};
        case 4:
            return {codigo: 4, descricao: 'Abril'};
        case 5:
            return {codigo: 5, descricao: 'Maio'};
        case 6:
            return {codigo: 6, descricao: 'Junho'};
        case 7:
            return {codigo: 7, descricao: 'Julho'};
        case 8:
            return {codigo: 8, descricao: 'Agosto'};
        case 9:
            return {codigo: 9, descricao: 'Setembro'};
        case 10:
            return {codigo: 10, descricao: 'Outubro'};
        case 11:
            return {codigo: 11, descricao: 'Novembro'};
        case 12:
            return {codigo: 12, descricao: 'Dezembro'};
        default:
            return {codigo: 0, descricao: 'Mês inválido'};
    }
}

export interface IMesesAno {
    codigo: number;
    descricao: string;
}

export const obterMesesAno = (): IMesesAno[] => {
    return [
        {codigo: 1, descricao: 'Janeiro'},
        {codigo: 2, descricao: 'Fevereiro'},
        {codigo: 3, descricao: 'Março'},
        {codigo: 4, descricao: 'Abril'},
        {codigo: 5, descricao: 'Maio'},
        {codigo: 6, descricao: 'Junho'},
        {codigo: 7, descricao: 'Julho'},
        {codigo: 8, descricao: 'Agosto'},
        {codigo: 9, descricao: 'Setembro'},
        {codigo: 10, descricao: 'Outubro'},
        {codigo: 11, descricao: 'Novembro'},
        {codigo: 12, descricao: 'Dezembro'},
    ]
}

export const getEmailStorage = (): string => {
    return emailStorage;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export enum UserRoles {
    'ADMIN' = 'ADMIN',
    'MEMBRO' = 'MEMBRO',
}

export const formatDateUS = (date: any): Date => {
    const dateFormat: string[] = date.toString().split('/');

    if (dateFormat) {
        return new Date(`${dateFormat[2]}-${dateFormat[1]}-${dateFormat[0]}T04:00:00.000Z`);
    }
    return new Date();
}

export const formatNome = (nome: string) => {
    return nome.toLowerCase().split(' ').map(function (palavra) {
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ');
}