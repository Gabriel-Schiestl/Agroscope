import { formatPersonName, isInstitutionalEmail } from '../UserProfileRules';
import { User } from '../User';

describe('UserProfileRules', () => {
    describe('formatPersonName', () => {
        it.each([
            ['joão silva', 'João Silva'],
            ['  MARIA   DA   SILVA ', 'Maria da Silva'],
            ['ana DOS santos e souza', 'Ana dos Santos e Souza'],
            ['de souza', 'De Souza'],
        ])('formats "%s" as "%s"', (input, expected) => {
            expect(formatPersonName(input)).toBe(expected);
        });
    });

    describe('isInstitutionalEmail', () => {
        it.each([
            'aluno@fag.edu.br',
            'servidor@receita.fazenda.gov.br',
            'prof@mit.edu',
            'juiz@tjpr.jus.br',
        ])('rejects institutional e-mail %s', (email) => {
            expect(isInstitutionalEmail(email)).toBe(true);
        });

        it.each(['joao@gmail.com', 'maria@empresa.com.br', 'x@educacao.com'])(
            'accepts personal e-mail %s',
            (email) => {
                expect(isInstitutionalEmail(email)).toBe(false);
            },
        );
    });

    describe('User', () => {
        const base = {
            email: 'joao@gmail.com',
            acceptedTerms: true,
            termsVersion: '2026-08-01',
        };

        it('formats the name on creation', () => {
            const result = User.create({ ...base, name: 'joão da silva' });
            expect(result.isSuccess() && result.value.name).toBe(
                'João da Silva',
            );
        });

        it('rejects names over 100 characters', () => {
            const result = User.create({ ...base, name: 'a'.repeat(101) });
            expect(result.isFailure()).toBe(true);
        });

        it('rejects institutional e-mails', () => {
            const result = User.create({
                ...base,
                name: 'João',
                email: 'joao@fag.edu.br',
            });
            expect(result.isFailure()).toBe(true);
        });

        it('changes and formats the name', () => {
            const user = User.create({ ...base, name: 'João' });
            if (user.isFailure()) throw user.error;

            expect(user.value.changeName('maria souza').isSuccess()).toBe(true);
            expect(user.value.name).toBe('Maria Souza');
            expect(user.value.changeName(' ').isFailure()).toBe(true);
            expect(user.value.name).toBe('Maria Souza');
        });
    });
});
