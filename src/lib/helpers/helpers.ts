import {IMesAtual} from "@/lib/models/mes-atual";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {UserApi} from "@/lib/api/user-api";

let emailStorage = '';

export const obterIniciaisPrimeiroUltimo = (nomeCompleto) => {
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

    return {codigo: 7, descricao: 'Julho'}
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
    let [user] = useAuthState(auth);
    let role = '';
    let mongoId = '';

    if (user) {
        const customAttributes = user['reloadUserInfo']['customAttributes'];

        if (customAttributes) {
            const getAttributes = JSON.parse(customAttributes);

            role = getAttributes['role'];
            mongoId = getAttributes['mongoId'];
        }
    } else {
        const userStorage = JSON.parse(sessionStorage.getItem('user'));

        if (sessionStorage.getItem('user')) {
            UserApi.getUserByEmail(userStorage['user']['email'])
                .then((result) => {
                    if (result) {
                        user = result;
                        role = result.customClaims.role;
                        mongoId = result.customClaims.mongoId;
                    }
                })
                .catch((error) => {
                    console.log('Erro ao recuperar os dados do membro!');
                })
        }
    }

    return {
        role,
        mongoId,
        user,
    }
}

export enum UserRoles {
    'ADMIN' = 'ADMIN',
    'MEMBRO' = 'MEMBRO',
}