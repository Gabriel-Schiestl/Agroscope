import { User } from '../User';
import { Limit } from '../Limit';
import { BusinessException } from 'src/shared/exceptions/Business.exception';

describe('User Domain', () => {
    it('should create a user successfully', () => {
        const result = User.create({
            name: 'John Doe',
            email: 'john@example.com',
            acceptedTerms: true,
            termsVersion: '2026-08-01',
        });
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value).toBeInstanceOf(User);
            expect(result.value.name).toBe('John Doe');
            expect(result.value.email).toBe('john@example.com');
            expect(result.value.id).toBeDefined();
            expect(result.value.termsAcceptedAt).toBeInstanceOf(Date);
            expect(result.value.termsVersion).toBe('2026-08-01');
        }
    });

    it('should fail to create a user without name', () => {
        const result = User.create({
            name: '',
            email: 'john@example.com',
            acceptedTerms: true,
            termsVersion: '2026-08-01',
        });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
            expect(result.error.message).toBe('Name is required');
        }
    });

    it('should fail to create a user without email', () => {
        const result = User.create({
            name: 'John Doe',
            email: '',
            acceptedTerms: true,
            termsVersion: '2026-08-01',
        });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
            expect(result.error.message).toBe('Email is required');
        }
    });

    it('should fail to create a user without accepting terms', () => {
        const result = User.create({
            name: 'John Doe',
            email: 'john@example.com',
            acceptedTerms: false,
            termsVersion: '2026-08-01',
        });
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error).toBeInstanceOf(BusinessException);
            expect(result.error.message).toBe(
                'A aceitação dos termos de uso e da política de privacidade é obrigatória',
            );
        }
    });

    it('should load a user with given id', () => {
        const user = User.load(
            { name: 'Jane', email: 'jane@example.com', limit: Limit.create() },
            'custom-id',
        );
        expect(user).toBeInstanceOf(User);
        expect(user.id).toBe('custom-id');
        expect(user.name).toBe('Jane');
        expect(user.email).toBe('jane@example.com');
    });
});
