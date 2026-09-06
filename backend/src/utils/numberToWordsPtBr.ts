/** Converte valor monetário para extenso em português (BRL). */
export function formatCurrencyInWordsPtBr(value: number): string {
  const amount = Math.round((Number(value) || 0) * 100);
  const reais = Math.floor(amount / 100);
  const centavos = amount % 100;

  const reaisText = numberToWordsPtBr(reais);
  let result = `${reaisText} ${reais === 1 ? 'real' : 'reais'}`;
  if (centavos > 0) {
    result += ` e ${numberToWordsPtBr(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }
  return result;
}

export function numberToWordsPtBr(n: number): string {
  if (!Number.isFinite(n) || n < 0) return 'zero';
  if (n === 0) return 'zero';

  const units = [
    'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
  ];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const chunk = (num: number): string => {
    if (num === 0) return '';
    if (num < 20) return units[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const u = num % 10;
      return u ? `${tens[t]} e ${units[u]}` : tens[t];
    }
    if (num === 100) return 'cem';
    const h = Math.floor(num / 100);
    const rest = num % 100;
    return rest ? `${hundreds[h]} e ${chunk(rest)}` : hundreds[h];
  };

  const parts: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  if (millions) {
    parts.push(millions === 1 ? 'um milhão' : `${chunk(millions)} milhões`);
  }
  if (thousands) {
    parts.push(thousands === 1 ? 'mil' : `${chunk(thousands)} mil`);
  }
  if (rest) {
    parts.push(chunk(rest));
  }

  return parts.join(' e ');
}
