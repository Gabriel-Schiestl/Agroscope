import { User } from 'src/modules/core/domain/models/User';
import { Failure, Success } from 'src/shared/Result';

describe('User domain model', () => {
    it('should create a new user', () => {
        const user = User.create({
            email: 'test@test',
            name: 'test',
            acceptedTerms: true,
            termsVersion: '2026-08-01',
        });

        expect(user).toBeInstanceOf(Success);
        expect(user.isSuccess() && user.value).toBeInstanceOf(User);
    });

    it('should return failure creating a new user', () => {
        const user = User.create({
            email: '',
            name: 'Test',
            acceptedTerms: true,
            termsVersion: '2026-08-01',
        });

        expect(user).toBeInstanceOf(Failure);
        expect(user.isFailure() && user.error.message).toBe(
            'Email is required',
        );
    });

    it('should return failure creating a user without accepting terms', () => {
        const user = User.create({
            email: 'test@test',
            name: 'test',
            acceptedTerms: false,
            termsVersion: '2026-08-01',
        });

        expect(user).toBeInstanceOf(Failure);
        expect(user.isFailure() && user.error.message).toBe(
            'A aceitação dos termos de uso e da política de privacidade é obrigatória',
        );
    });
});
