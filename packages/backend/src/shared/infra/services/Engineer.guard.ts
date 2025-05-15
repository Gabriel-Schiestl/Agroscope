import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class EngineerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return user && user.engineer;
    }
}
