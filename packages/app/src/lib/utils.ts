import type { AnalyticsGranularity } from '@/models/Analytics';

export function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

// Nomes fixos em PT-BR: o Hermes (motor JS do React Native) nem sempre
// embarca os dados ICU completos do locale "pt-BR" em todos os builds,
// e nesse caso o toLocaleDateString cai silenciosamente para inglês
// (ou até inverte dia/mês). Formatando manualmente evitamos depender
// disso.
const MONTH_ABBREVIATIONS_PT_BR = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function pad2(value: number): string {
    return String(value).padStart(2, '0');
}

export function formatPeriodLabel(
    period: string,
    granularity: AnalyticsGranularity,
): string {
    const date = new Date(`${period}T00:00:00`);
    if (Number.isNaN(date.getTime())) return period;

    const day = pad2(date.getDate());
    const month = pad2(date.getMonth() + 1);

    if (granularity === 'month') {
        const monthAbbrev = MONTH_ABBREVIATIONS_PT_BR[date.getMonth()];
        const year = String(date.getFullYear()).slice(-2);
        return `${monthAbbrev}/${year}`;
    }
    if (granularity === 'week') {
        return `Sem. ${day}/${month}`;
    }
    return `${day}/${month}`;
}

// O backend persiste a imagem da análise como base64 puro (sem prefixo data:).
export function imageToDataUri(image?: string): string | undefined {
    if (!image) return undefined;
    if (/^(data:|https?:)/.test(image)) return image;
    return `data:image/jpeg;base64,${image}`;
}
