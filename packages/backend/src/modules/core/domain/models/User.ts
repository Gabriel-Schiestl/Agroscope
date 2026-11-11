import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';
import { v4 as uuid } from 'uuid';
import { Limit } from './Limit';
import {
    formatPersonName,
    INSTITUTIONAL_EMAIL_MESSAGE,
    isInstitutionalEmail,
    NAME_LENGTH_MESSAGE,
    NAME_MAX_LENGTH,
} from './UserProfileRules';

export interface UserProps {
    name: string;
    email: string;
    limit: Limit;
    planId?: string;
    termsAcceptedAt?: Date;
    termsVersion?: string;
}

export interface CreateUserProps {
    name: string;
    email: string;
    planId?: string;
    acceptedTerms: boolean;
    termsVersion: string;
}
export interface LoadUserProps extends UserProps {}

export class User implements UserProps {
    #id: string;
    #name: string;
    #email: string;
    #limit: Limit;
    #planId?: string;
    #termsAcceptedAt?: Date;
    #termsVersion?: string;

    private constructor(props: UserProps, id?: string) {
        this.#id = id || uuid();
        this.#name = props.name;
        this.#email = props.email;
        this.#limit = props.limit;
        this.#planId = props.planId;
        this.#termsAcceptedAt = props.termsAcceptedAt;
        this.#termsVersion = props.termsVersion;
    }

    static create(props: CreateUserProps): Result<BusinessException, User> {
        if (!props.name) {
            return Res.failure(new BusinessException('Name is required'));
        }
        if (!props.email) {
            return Res.failure(new BusinessException('Email is required'));
        }
        if (!props.acceptedTerms) {
            return Res.failure(
                new BusinessException(
                    'A aceitação dos termos de uso e da política de privacidade é obrigatória',
                ),
            );
        }
        if (isInstitutionalEmail(props.email)) {
            return Res.failure(
                new BusinessException(INSTITUTIONAL_EMAIL_MESSAGE),
            );
        }

        const name = formatPersonName(props.name);
        if (name.length > NAME_MAX_LENGTH) {
            return Res.failure(new BusinessException(NAME_LENGTH_MESSAGE));
        }

        const limit = Limit.create();

        return Res.success(
            new User({
                ...props,
                name,
                limit,
                termsAcceptedAt: new Date(),
            }),
        );
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

    get termsAcceptedAt() {
        return this.#termsAcceptedAt;
    }

    get termsVersion() {
        return this.#termsVersion;
    }

    changeName(name: string): Result<BusinessException, void> {
        const formatted = formatPersonName(name ?? '');
        if (formatted.length < 2) {
            return Res.failure(new BusinessException('Name is required'));
        }
        if (formatted.length > NAME_MAX_LENGTH) {
            return Res.failure(new BusinessException(NAME_LENGTH_MESSAGE));
        }
        this.#name = formatted;

        return Res.success();
    }

    changePlan(planId: string): Result<BusinessException, void> {
        if (!planId) {
            return Res.failure(new BusinessException('Plan is required'));
        }
        this.#planId = planId;

        return Res.success();
    }
}
