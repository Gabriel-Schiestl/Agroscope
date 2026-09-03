import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { AuthenticationService } from '../../../domain/services/Authentication.service';
import { AESService } from '../../../domain/services/AES.service';
import { AuthGuard } from '../Auth.guard';

describe('AuthGuard', () => {
    let authenticationService: jest.Mocked<AuthenticationService>;
    let aesService: jest.Mocked<AESService>;
    let reflector: jest.Mocked<Reflector>;
    let guard: AuthGuard;

    const buildContext = (request: any): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getRequest: () => request,
            }),
            getHandler: () => jest.fn(),
            getClass: () => jest.fn(),
        }) as unknown as ExecutionContext;

    beforeEach(() => {
        authenticationService = {
            sign: jest.fn(),
            verify: jest
                .fn()
                .mockResolvedValue(
                    Res.success({ name: 'Gabriel', email: 'g@e.com', sub: 'user-1' }),
                ),
        };
        aesService = {
            encrypt: jest.fn(),
            decrypt: jest.fn().mockResolvedValue(Res.success('decrypted-jwt')),
        };
        reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(false),
        } as unknown as jest.Mocked<Reflector>;
        guard = new AuthGuard(authenticationService, reflector, aesService);
    });

    it('should allow access to public routes without checking the token', async () => {
        reflector.getAllAndOverride.mockReturnValue(true);
        const context = buildContext({});

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(aesService.decrypt).not.toHaveBeenCalled();
    });

    it('should throw when there is no token in cookies or headers', async () => {
        const context = buildContext({ cookies: {}, headers: {} });

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
    });

    it('should authenticate using the cookie token and attach the user to the request', async () => {
        const request = {
            cookies: { 'agroscope-authentication': 'encrypted-cookie-token' },
            headers: {},
        };
        const context = buildContext(request);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(aesService.decrypt).toHaveBeenCalledWith(
            'encrypted-cookie-token',
        );
        expect(request['user']).toEqual({
            name: 'Gabriel',
            email: 'g@e.com',
            sub: 'user-1',
        });
    });

    it('should fall back to the authorization header when no cookie is present', async () => {
        const request = {
            cookies: {},
            headers: { authorization: 'Bearer encrypted-header-token' },
        };
        const context = buildContext(request);

        await guard.canActivate(context);

        expect(aesService.decrypt).toHaveBeenCalledWith(
            'Bearer encrypted-header-token',
        );
    });

    it('should throw when decryption fails', async () => {
        aesService.decrypt.mockResolvedValue(
            Res.failure(new BusinessException('bad token')),
        );
        const request = {
            cookies: { 'agroscope-authentication': 'garbage' },
            headers: {},
        };
        const context = buildContext(request);

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
    });

    it('should throw when the token fails verification', async () => {
        authenticationService.verify.mockResolvedValue(
            Res.failure(new TechnicalException('invalid token')),
        );
        const request = {
            cookies: { 'agroscope-authentication': 'encrypted-cookie-token' },
            headers: {},
        };
        const context = buildContext(request);

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
    });
});
