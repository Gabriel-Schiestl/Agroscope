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

        const token =
            request.headers.cookie?.split('=')[1] ||
            request.headers.authorization ||
            request.cookies['agroscope-authentication'];

        if (!token) {
            throw new UnauthorizedException('Token not found');
            return false;
        }

        const payload = await this.authenticationService.verify(token);
        if (payload.isFailure())
            throw new UnauthorizedException('Token not found');

        request.session = payload.value;

        return true;
    }
}
