import { ExecutionContext } from '@nestjs/common';
import { EngineerGuard } from '../Engineer.guard';

describe('EngineerGuard', () => {
    const guard = new EngineerGuard();

    const buildContext = (user: any): ExecutionContext =>
        ({
            switchToHttp: () => ({ getRequest: () => ({ user }) }),
        }) as unknown as ExecutionContext;

    it('should allow access for an engineer user', () => {
        expect(guard.canActivate(buildContext({ engineer: true }))).toBe(
            true,
        );
    });

    it('should deny access for a non-engineer user', () => {
        expect(guard.canActivate(buildContext({ engineer: false }))).toBe(
            false,
        );
    });

    it('should deny access when there is no user on the request', () => {
        expect(guard.canActivate(buildContext(undefined))).toBeFalsy();
    });
});
