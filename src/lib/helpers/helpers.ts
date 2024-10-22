import {IMesAtual} from "@/lib/models/mes-atual";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {UserApi} from "@/lib/api/user-api";
import {format} from "date-fns";

let emailStorage = '';
let user: any = {};

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

export const setEmailStorage = (email: string) => {
    emailStorage = email;
}

export const getEmailStorage = (): string => {
    return emailStorage;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getContextAuth = (): any => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let [user]: any = useAuthState(auth);
    let role: string = '';
    let mongoId: string = '';

    if (user) {
        const customAttributes = user['reloadUserInfo']['customAttributes'];

        if (customAttributes) {
            const getAttributes = JSON.parse(customAttributes);

            role = getAttributes['role'];
            mongoId = getAttributes['mongoId'];
        }
    } else {
        const storage = getUser();

        if (storage && storage.length > 0) {
            const userStorage = JSON.parse(storage);

            if (userStorage && userStorage['user']) {
                UserApi.getUserByEmail(userStorage['user']['email'])
                    .then((result: any) => {
                        if (result) {
                            user = result;
                            role = result.customClaims.role;
                            mongoId = result.customClaims.mongoId;
                        }
                    })
                    .catch((error: any) => {
                        console.log('Erro ao recuperar os dados do membro!');
                    })
            } else {
                user = null;
                role = '';
                mongoId = '';
            }
        }
    }

    return {
        role,
        mongoId,
        user,
    }
}

export const setUser = (newUser: any) => {
    user = newUser;
    // console.log('HELPER [USER]: ', user);
}

export const getUser = (): any => {
    return user;
}

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