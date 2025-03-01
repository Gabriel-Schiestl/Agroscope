import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export enum UserRole {
    User = 'user',
    Engineer = 'engineer',
    Admin = 'admin',
}

export interface UserProps {
    name: string;
    email: string;
    role: UserRole;
}

export interface CreateUserProps extends UserProps {}
export interface LoadUserProps extends UserProps {}

export class User implements UserProps {
    #id: string;
    #name: string;
    #email: string;
    #role: UserRole;

    private constructor(props: UserProps, id?: string) {
        this.#id = id;
        this.#name = props.name;
        this.#email = props.email;
        this.#role = props.role;
    }

    static create(props: CreateUserProps): Result<BusinessException, User> {
        if (!props.name) {
            return Res.failure(new BusinessException('Name is required'));
        }
        if (!props.email) {
            return Res.failure(new BusinessException('Email is required'));
        }
        if (!props.role) {
            return Res.failure(new BusinessException('Role is required'));
        }

        return Res.success(new User(props));
    }

    static load(props: LoadUserProps, id: string): User {
        return new User(props, id);
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get email() {
        return this.#email;
    }

    get role() {
        return this.#role;
    }
}
