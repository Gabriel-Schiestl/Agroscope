// Mesmas regras do backend (core/domain/models/UserProfileRules.ts), RF01 do
// Documento de Requisitos: nome com até 100 caracteres e iniciais em
// maiúscula; e-mail não pode ser institucional.

export const NAME_MAX_LENGTH = 100;

const NAME_PARTICLES = new Set(['da', 'das', 'de', 'di', 'do', 'dos', 'e']);

export function formatPersonName(name: string): string {
    return name
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((word, index) => {
            const lower = word.toLocaleLowerCase('pt-BR');
            if (index > 0 && NAME_PARTICLES.has(lower)) return lower;
            return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
        })
        .join(' ');
}

const INSTITUTIONAL_SUFFIXES = [
    '.edu',
    '.edu.br',
    '.gov',
    '.gov.br',
    '.mil',
    '.mil.br',
    '.jus.br',
    '.leg.br',
    '.mp.br',
    '.def.br',
];

export function isInstitutionalEmail(email: string): boolean {
    const domain = email.trim().toLowerCase().split('@')[1];
    if (!domain) return false;
    return INSTITUTIONAL_SUFFIXES.some((suffix) => domain.endsWith(suffix));
}

export const INSTITUTIONAL_EMAIL_MESSAGE =
    'Use um e-mail pessoal. E-mails institucionais (educacionais ou governamentais) não são aceitos.';
