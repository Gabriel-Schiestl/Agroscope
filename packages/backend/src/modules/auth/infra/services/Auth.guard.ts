import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from '../../domain/services/Authentication.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject('AuthenticationService')
        private readonly authenticationService: AuthenticationService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();

        let token: string | undefined;

        if (request.headers.cookie) {
            const cookies = request.headers.cookie.split(';');
            const agroscopeCookie = cookies.find((cookie) =>
                cookie.trim().startsWith('agroscope-authentication='),
            );
            if (agroscopeCookie) {
                token = agroscopeCookie.split('=')[1].trim();
            }
        }

        token =
            token ||
            request.headers.authorization ||
            request.cookies?.['agroscope-authentication'];

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        const payload = await this.authenticationService.verify(token);
        if (payload.isFailure()) {
            throw new UnauthorizedException('Token not found');
        }

        request.user = payload.value;

        return true;
    }
}
