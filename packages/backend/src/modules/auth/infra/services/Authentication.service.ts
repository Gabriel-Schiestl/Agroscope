import { Injectable } from '@nestjs/common';
import {
    AuthenticationService,
    JwtPayload,
} from '../../domain/services/Authentication.service';
import { JwtService } from '@nestjs/jwt';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

@Injectable()
export class AuthenticationServiceImpl implements AuthenticationService {
    constructor(private readonly jwtService: JwtService) {}

    async sign(payload: JwtPayload): Promise<string> {
        const token = this.jwtService.sign(payload);

        return token;
    }

    async verify(
        token: string,
    ): Promise<Result<TechnicalException, JwtPayload>> {
        let payload: JwtPayload;
        try {
            payload = this.jwtService.verify(token);
        } catch {
            return Res.failure(new TechnicalException('Invalid token'));
        }

        if (!payload || !payload.email || !payload.sub) {
            return Res.failure(new TechnicalException('Invalid token'));
        }

        return Res.success(payload);
    }
}
