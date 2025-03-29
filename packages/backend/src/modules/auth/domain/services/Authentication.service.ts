import { Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

export interface JwtPayload {
    email: string;
    sub: string;
    engineer?: boolean;
    admin?: boolean;
}

export interface AuthenticationService {
    sign(payload: JwtPayload): Promise<string>;
    verify(token: string): Promise<Result<TechnicalException, JwtPayload>>;
}
