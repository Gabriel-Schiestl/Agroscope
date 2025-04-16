import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from '../../domain/services/Authentication.service';
import { Reflector } from '@nestjs/core';
import { AESService } from '../../domain/services/AES.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject('AuthenticationService')
        private readonly authenticationService: AuthenticationService,
        private readonly reflector: Reflector,
        @Inject('AESService')
        private readonly aesService: AESService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();

        const token =
            request.cookies?.['agroscope-authentication'] ||
            request.headers['authorization'];

        if (!token) {
            throw new UnauthorizedException('Invalid token');
        }

        const decryptedToken = await this.aesService.decrypt(token);
        if (decryptedToken.isFailure()) {
            throw new UnauthorizedException('Invalid token');
        }

        const payload = await this.authenticationService.verify(
            decryptedToken.value,
        );
        if (payload.isFailure()) {
            throw new UnauthorizedException('Invalid token');
        }

        request.user = payload.value;

        return true;
    }
}
