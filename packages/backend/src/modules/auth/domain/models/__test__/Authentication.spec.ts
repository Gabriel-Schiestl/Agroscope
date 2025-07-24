import { Authentication } from '../Authentication';
import { BusinessException } from 'src/shared/exceptions/Business.exception';

describe('Authentication', () => {
    const validProps = {
        email: 'test@example.com',
        password: 'securePassword123',
    };

    it('should create a valid Authentication instance', () => {
        const result = Authentication.create(validProps);
        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value.email).toBe(validProps.email);
        expect(result.isSuccess() && result.value.password).toBe(
            validProps.password,
        );
    });

    it('should fail to create without email', () => {
        const result = Authentication.create({ ...validProps, email: '' });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail to create without password', () => {
        const result = Authentication.create({ ...validProps, password: '' });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should increment incorrect password attempts and block after 5', () => {
        const result = Authentication.create(validProps);
        expect(result.isSuccess()).toBe(true);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        for (let i = 0; i < 5; i++) {
            auth.incrementIncorrectPasswordAttempts();
        }
        expect(auth.incorrectPasswordAttempts).toBe(5);
        expect(auth.verifyAuthenticationBlocked()).toBe(true);
    });

    it('should reset incorrect password attempts on login', () => {
        const result = Authentication.create(validProps);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        auth.incrementIncorrectPasswordAttempts();
        auth.applyLogin();
        expect(auth.incorrectPasswordAttempts).toBe(0);
        expect(auth.lastLogin).toBeInstanceOf(Date);
    });

    it('should set and validate recovery token', () => {
        const result = Authentication.create(validProps);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        auth.setRecoveryToken('token123');
        expect(auth.recoveryCode).toBe('token123');
        expect(auth.recoveryCodeExpiration).toBeInstanceOf(Date);
        const validate = auth.validateRecoveryToken('token123');
        expect(validate.isSuccess()).toBe(true);
    });

    it('should fail to validate recovery token if incorrect', () => {
        const result = Authentication.create(validProps);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        auth.setRecoveryToken('token123');
        const validate = auth.validateRecoveryToken('wrong');
        expect(validate.isFailure()).toBe(true);
        expect(validate.isFailure() && validate.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should increment incorrect recovery attempts and block after 5', () => {
        const result = Authentication.create(validProps);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        auth.setRecoveryToken('token123');
        for (let i = 0; i < 5; i++) {
            auth.incrementIncorrectRecoveryAttempts();
        }
        // Now should fail due to too many attempts
        const validate = auth.validateRecoveryToken('token123');
        expect(validate.isFailure()).toBe(true);
        expect(validate.isFailure() && validate.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should change password with valid token', () => {
        const result = Authentication.create(validProps);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        auth.setRecoveryToken('token123');
        const change = auth.applyPasswordChange('token123', 'newPassword');
        expect(change.isSuccess()).toBe(true);
        expect(auth.password).toBe('newPassword');
        expect(auth.recoveryCode).toBeNull();
        expect(auth.recoveryCodeExpiration).toBeNull();
        expect(auth.incorrectRecoveryAttempts).toBe(0);
    });

    it('should not change password with invalid token', () => {
        const result = Authentication.create(validProps);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        auth.setRecoveryToken('token123');
        const change = auth.applyPasswordChange('wrong', 'newPassword');
        expect(change.isFailure()).toBe(true);
        expect(change.isFailure() && change.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should not change password if token expired', () => {
        const result = Authentication.create(validProps);
        let auth: Authentication;
        if (result.isSuccess()) {
            auth = result.value;
        }
        auth.setRecoveryToken('token123');
        (auth as any)['#recoveryCodeExpiration'] = new Date(Date.now() - 10000);
        const change = auth.applyPasswordChange('token123', 'newPassword');
        expect(change.isFailure()).toBe(true);
        expect(change.isFailure() && change.error).toBeInstanceOf(
            BusinessException,
        );
    });
});
