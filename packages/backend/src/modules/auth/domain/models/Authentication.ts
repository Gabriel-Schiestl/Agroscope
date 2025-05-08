import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export interface AuthenticationProps {
    email: string;
    password: string;
    lastLogin?: Date;
    recoveryCode?: string;
    recoveryCodeExpiration?: Date;
    incorrectPasswordAttempts?: number;
    incorrectRecoveryAttempts?: number;
}

export interface CreateAuthenticationProps extends AuthenticationProps {}

export interface LoadAuthenticationProps extends AuthenticationProps {}

export class Authentication implements AuthenticationProps {
    #id: string;
    #email: string;
    #password: string;
    #lastLogin?: Date;
    #recoveryCode?: string;
    #recoveryCodeExpiration?: Date;
    #incorrectPasswordAttempts?: number;
    #incorrectRecoveryAttempts?: number;

    private constructor(props: AuthenticationProps, id?: string) {
        this.#id = id;
        this.#email = props.email;
        this.#password = props.password;
        this.#lastLogin = props.lastLogin;
        this.#recoveryCode = props.recoveryCode;
        this.#recoveryCodeExpiration = props.recoveryCodeExpiration;
        this.#incorrectRecoveryAttempts = props.incorrectRecoveryAttempts;
    }

    static create(
        props: CreateAuthenticationProps,
    ): Result<BusinessException, Authentication> {
        if (!props.email) {
            return Res.failure(new BusinessException('Email is required'));
        }
        if (!props.password) {
            return Res.failure(new BusinessException('Password is required'));
        }

        return Res.success(new Authentication(props));
    }

    static load(props: LoadAuthenticationProps, id: string): Authentication {
        return new Authentication(props, id);
    }

    verifyAuthenticationBlocked(): boolean {
        return this.#incorrectPasswordAttempts >= 5;
    }

    applyLogin(): void {
        this.#lastLogin = new Date();
        this.#incorrectPasswordAttempts = 0;
    }

    incrementIncorrectPasswordAttempts(): void {
        if (!this.#incorrectPasswordAttempts) {
            this.#incorrectPasswordAttempts = 0;
        }
        this.#incorrectPasswordAttempts += 1;
    }

    incrementIncorrectRecoveryAttempts(): void {
        if (!this.#incorrectRecoveryAttempts) {
            this.#incorrectRecoveryAttempts = 0;
        }
        this.#incorrectRecoveryAttempts += 1;
    }

    setRecoveryToken(token: string) {
        this.#incorrectRecoveryAttempts = 0;
        this.#recoveryCode = token;
        this.#recoveryCodeExpiration = new Date(
            new Date().getTime() + 5 * 60 * 1000,
        );
    }

    validateRecoveryToken(token: string): Result<BusinessException, void> {
        if (this.#incorrectRecoveryAttempts > 4)
            return Res.failure(
                new BusinessException('You exceed incorrect attempts limit'),
            );

        if (new Date().getTime() > this.#recoveryCodeExpiration.getTime())
            return Res.failure(new BusinessException('Invalid Token'));

        if (this.#recoveryCode !== token)
            return Res.failure(new BusinessException('Invalid Token'));

        this.#incorrectRecoveryAttempts = 0;
        this.#recoveryCodeExpiration = new Date(
            new Date().getTime() + 5 * 60 * 1000,
        );

        return Res.success();
    }

    applyPasswordChange(
        token: string,
        newPassword: string,
    ): Result<BusinessException, void> {
        if (this.#recoveryCode !== token)
            return Res.failure(new BusinessException('Invalid token'));
        if (new Date().getTime() > this.#recoveryCodeExpiration.getTime())
            return Res.failure(
                new BusinessException(
                    'You exceed change password time limit. Please, request a new recovery password token',
                ),
            );

        this.#password = newPassword;
        this.#recoveryCode = null;
        this.#recoveryCodeExpiration = null;
        this.#incorrectRecoveryAttempts = 0;

        return Res.success();
    }

    get id() {
        return this.#id;
    }

    get email() {
        return this.#email;
    }

    get password() {
        return this.#password;
    }

    get lastLogin() {
        return this.#lastLogin;
    }

    get recoveryCode() {
        return this.#recoveryCode;
    }

    get recoveryCodeExpiration() {
        return this.#recoveryCodeExpiration;
    }

    get incorrectPasswordAttempts() {
        return this.#incorrectPasswordAttempts;
    }

    get incorrectRecoveryAttempts() {
        return this.#incorrectRecoveryAttempts;
    }
}
