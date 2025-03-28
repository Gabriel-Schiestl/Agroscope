import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export interface AuthenticationProps {
    email: string;
    password: string;
    lastLogin?: Date;
    recoveryCode?: string;
    recoveryCodeExpiration?: Date;
    incorrectPasswordAttempts?: number;
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

    private constructor(props: AuthenticationProps, id?: string) {
        this.#id = id;
        this.#email = props.email;
        this.#password = props.password;
        this.#lastLogin = props.lastLogin;
        this.#recoveryCode = props.recoveryCode;
        this.#recoveryCodeExpiration = props.recoveryCodeExpiration;
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
}
