import {IMesAtual} from "@/lib/models/mes-atual";
import {formatDate} from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

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

export const formatDateUS = (date: any, key?: string): Date | string => {
    if (date) {
        const dateFormat: string[] = date.toString().split('/');

        if (dateFormat) {
            return new Date(`${dateFormat[2]}-${dateFormat[1]}-${dateFormat[0]}T04:00:00.000Z`);
        }
    }

    return '';
}

export const formatNome = (nome: string) => {
    return nome.toLowerCase().split(' ').map(function (palavra) {
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ');
}

export const formatDateShort = (date: string) => {
    if (!date) {
        return new Date(formatDate(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd', {locale: ptBR}))
    }

    if (typeof date === 'object') {
        return date;
    }
    return new Date(formatDate(new Date(date).setDate(new Date(date).getDate() + 1), 'yyyy-MM-dd', {locale: ptBR}))
}

export async function compressBase64Image(
    base64Image: string,
    maxWidth: number,
    quality: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject('Erro ao criar contexto do Canvas.');
                return;
            }

            // Calcular escala mantendo a proporção
            const scale = maxWidth / img.width;
            const newWidth = maxWidth;
            const newHeight = img.height * scale;

            // Configurar tamanho do canvas
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Desenhar imagem no canvas
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Exportar como Base64 comprimido no formato JPEG
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject('Erro ao criar Blob.');
                        return;
                    }

                    // Ler o Blob como Base64
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(blob);
                },
                'image/jpeg', // Formato de saída
                quality // Qualidade da compressão (0 a 1)
            );
        };

        img.onerror = (err) => reject(err);

        // Configurar a origem da imagem como o Base64 fornecido
        img.src = base64Image;
    });
}

export function passouUmaHora(timestamp: number): boolean {
    const umaHoraEmMs: number = 60 * 60 * 1000; // 1 hora em milissegundos
    const tempoAtualAteTempoLogin = new Date().getTime() - timestamp;

    return tempoAtualAteTempoLogin > umaHoraEmMs;
}