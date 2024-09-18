import {IMesAtual} from "@/lib/models/mes-atual";

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

    // return { codigo: 7, descricao: 'Julho' }
    switch (month) {
        case 1:
            return { codigo: 1, descricao: 'Janeiro' };
        case 2:
            return { codigo: 2, descricao: 'Fevereiro' };
        case 3:
            return { codigo: 3, descricao: 'Março' };
        case 4:
            return { codigo: 4, descricao: 'Abril' };
        case 5:
            return { codigo: 5, descricao: 'Maio' };
        case 6:
            return { codigo: 6, descricao: 'Junho' };
        case 7:
            return { codigo: 7, descricao: 'Julho' };
        case 8:
            return { codigo: 8, descricao: 'Agosto' };
        case 9:
            return { codigo: 9, descricao: 'Setembro' };
        case 10:
            return { codigo: 10, descricao: 'Outubro' };
        case 11:
            return { codigo: 11, descricao: 'Novembro' };
        case 12:
            return { codigo: 12, descricao: 'Dezembro' };
        default:
            return { codigo: 0, descricao: 'Mês inválido' };
    }
}