import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuid } from 'uuid';
import { Limit } from './Limit';

export interface UserProps {
    name: string;
    email: string;
    limit: Limit;
    planId?: string;
}

export interface CreateUserProps extends UserProps {}
export interface LoadUserProps extends UserProps {}

export class User implements UserProps {
    #id: string;
    #name: string;
    #email: string;
    #limit: Limit;
    #planId?: string;

    private constructor(props: UserProps, id?: string) {
        this.#id = id || uuid();
        this.#name = props.name;
        this.#email = props.email;
        this.#limit = props.limit;
        this.#planId = props.planId;
    }

    static create(props: CreateUserProps): Result<BusinessException, User> {
        if (!props.name) {
            return Res.failure(new BusinessException('Name is required'));
        }
        if (!props.email) {
            return Res.failure(new BusinessException('Email is required'));
        }
        if (!props.limit) {
            return Res.failure(new BusinessException('Limit is required'));
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

    get planId() {
        return this.#planId;
    }

    get limit() {
        return this.#limit;
    }
}
