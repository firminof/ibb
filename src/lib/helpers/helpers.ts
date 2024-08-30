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