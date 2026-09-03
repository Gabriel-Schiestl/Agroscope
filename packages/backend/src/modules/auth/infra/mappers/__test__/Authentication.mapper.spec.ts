import { Authentication } from '../../../domain/models/Authentication';
import { AuthenticationModel } from '../../models/Authentication.model';
import { AuthenticationMapper } from '../Authentication.mapper';

describe('AuthenticationMapper', () => {
    const mapper = new AuthenticationMapper();

    it('should map a domain Authentication to an AuthenticationModel', () => {
        const authResult = Authentication.create({
            email: 'gabriel@example.com',
            password: 'hashed-password',
        });
        if (authResult.isFailure()) throw new Error('setup failed');
        const authentication = authResult.value;

        const model = mapper.domainToModel(authentication);

        expect(model).toBeInstanceOf(AuthenticationModel);
        expect(model.id).toBe(authentication.id);
        expect(model.email).toBe('gabriel@example.com');
        expect(model.password).toBe('hashed-password');
    });

    it('should map an AuthenticationModel back to a domain Authentication', () => {
        const lastLogin = new Date('2026-01-01');
        const model = new AuthenticationModel().setProps({
            id: 'auth-1',
            email: 'gabriel@example.com',
            password: 'hashed-password',
            lastLogin,
            recoveryCode: 'token123',
            recoveryCodeExpiration: new Date('2026-01-02'),
            incorrectPasswordAttempts: 2,
            incorrectRecoveryAttempts: 1,
        });

        const authentication = mapper.modelToDomain(model);

        expect(authentication).toBeInstanceOf(Authentication);
        expect(authentication.id).toBe('auth-1');
        expect(authentication.email).toBe('gabriel@example.com');
        expect(authentication.password).toBe('hashed-password');
        expect(authentication.lastLogin).toBe(lastLogin);
        expect(authentication.recoveryCode).toBe('token123');
        expect(authentication.incorrectPasswordAttempts).toBe(2);
        expect(authentication.incorrectRecoveryAttempts).toBe(1);
    });
});
