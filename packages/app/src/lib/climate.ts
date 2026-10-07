import type { ClimateMismatch, ClimateValidation, Season } from '@/models/History';

const SEASON_LABELS: Record<Season, string> = {
    spring: 'primavera',
    summer: 'verão',
    autumn: 'outono',
    winter: 'inverno',
};

const MISMATCH_LABELS: Record<ClimateMismatch, string> = {
    temperature: 'temperatura fora da faixa favorável',
    humidity: 'umidade fora da faixa favorável',
    season: 'estação do ano desfavorável',
};

const formatNumber = (value: number) =>
    value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Ex.: "média de 24,3 °C e 82% de umidade, primavera" */
export function describeRegionalClimate(validation: ClimateValidation): string {
    const parts = `média de ${formatNumber(validation.temperature)} °C e ${formatNumber(validation.humidity)}% de umidade`;
    return validation.season ? `${parts}, ${SEASON_LABELS[validation.season]}` : parts;
}

export function describeClimateMismatches(mismatches: ClimateMismatch[]): string {
    return mismatches.map((m) => MISMATCH_LABELS[m]).join(', ');
}

export function climateValidationTitle(validation: ClimateValidation): string {
    return validation.compatible
        ? 'Compatível com o clima da sua região'
        : 'Doença pouco provável para o clima da sua região';
}

export function climateValidationMessage(validation: ClimateValidation): string {
    const climate = describeRegionalClimate(validation);
    return validation.compatible
        ? `O clima dos últimos 7 dias na sua região (${climate}) favorece esta doença.`
        : `O clima dos últimos 7 dias na sua região (${climate}) não favorece esta doença: ${describeClimateMismatches(validation.mismatches)}. Confira os sintomas com atenção, envie outra foto ou consulte um agrônomo.`;
}

/** Ex.: "-23,55, -46,63" (coordenadas já arredondadas pelo backend) */
export function formatClimateCoordinates(validation: ClimateValidation): string {
    const fmt = (value: number) =>
        value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${fmt(validation.latitude)}, ${fmt(validation.longitude)}`;
}
