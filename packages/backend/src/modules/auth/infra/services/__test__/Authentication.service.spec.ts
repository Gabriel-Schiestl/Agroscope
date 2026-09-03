import { JwtService } from '@nestjs/jwt';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { JwtPayload } from '../../../domain/services/Authentication.service';
import { AuthenticationServiceImpl } from '../Authentication.service';

describe('AuthenticationServiceImpl', () => {
    let jwtService: jest.Mocked<JwtService>;
    let service: AuthenticationServiceImpl;

    const payload: JwtPayload = {
        name: 'Gabriel',
        email: 'gabriel@example.com',
        sub: 'user-1',
    };

    beforeEach(() => {
        jwtService = {
            sign: jest.fn().mockReturnValue('signed-jwt'),
            verify: jest.fn().mockReturnValue(payload),
        } as unknown as jest.Mocked<JwtService>;
        service = new AuthenticationServiceImpl(jwtService);
    });

    it('should sign a payload into a token', async () => {
        const token = await service.sign(payload);
        expect(token).toBe('signed-jwt');
        expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });

    it('should verify a valid token and return its payload', async () => {
        const result = await service.verify('signed-jwt');
        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toEqual(payload);
    });

    it('should fail when the decoded payload is missing required fields', async () => {
        jwtService.verify.mockReturnValue({ name: 'Gabriel' } as any);

        const result = await service.verify('incomplete-token');
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            TechnicalException,
        );
    });
});
