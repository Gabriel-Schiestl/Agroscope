import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { LoginUseCase } from '../../application/usecases/Login.usecase';
import { PasswordRecoveryUseCase } from '../../application/usecases/PasswordRecovery.usecase';
import { ValidateRecoveryTokenUseCase } from '../../application/usecases/ValidateRecoveryToken.usecase';
import { ChangePasswordUseCase } from '../../application/usecases/ChangePassword.usecase';
import { AuthUserRepository } from '../../domain/repositories/AuthUser.repository';
import { AuthController } from '../Auth.controller';

describe('AuthController', () => {
    let loginUseCase: jest.Mocked<LoginUseCase>;
    let passwordRecoveryUseCase: jest.Mocked<PasswordRecoveryUseCase>;
    let validateRecoveryTokenUseCase: jest.Mocked<ValidateRecoveryTokenUseCase>;
    let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;
    let authUserRepository: jest.Mocked<AuthUserRepository>;
    let controller: AuthController;

    const buildRes = () => {
        const res: any = {};
        res.cookie = jest.fn().mockReturnValue(res);
        res.clearCookie = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        loginUseCase = { execute: jest.fn() } as unknown as jest.Mocked<LoginUseCase>;
        passwordRecoveryUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<PasswordRecoveryUseCase>;
        validateRecoveryTokenUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<ValidateRecoveryTokenUseCase>;
        changePasswordUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<ChangePasswordUseCase>;
        authUserRepository = {
            getByEmail: jest.fn(),
            getById: jest.fn(),
        };
        controller = new AuthController(
            loginUseCase,
            passwordRecoveryUseCase,
            validateRecoveryTokenUseCase,
            changePasswordUseCase,
            authUserRepository,
        );
    });

    describe('login', () => {
        it('should set the auth cookie and return 200 on success', async () => {
            loginUseCase.execute.mockResolvedValue(
                Res.success('encrypted-token'),
            );
            const res = buildRes();

            await controller.login(
                { email: 'g@e.com', password: 'pass' },
                res,
            );

            expect(res.cookie).toHaveBeenCalledWith(
                'agroscope-authentication',
                'encrypted-token',
                expect.objectContaining({ httpOnly: true }),
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: 'encrypted-token' });
        });

        it('should not set a cookie and return 401 on failure', async () => {
            const error = new BusinessException('Error on login');
            loginUseCase.execute.mockResolvedValue(Res.failure(error));
            const res = buildRes();

            await controller.login(
                { email: 'g@e.com', password: 'wrong' },
                res,
            );

            expect(res.cookie).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(error);
        });
    });

    describe('logout', () => {
        it('should clear the auth cookie and return success', async () => {
            const res = buildRes();

            await controller.logout(res);

            expect(res.clearCookie).toHaveBeenCalledWith(
                'agroscope-authentication',
                expect.objectContaining({ httpOnly: true }),
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    });

    describe('validate', () => {
        it("should include the user's planId when the user is found", async () => {
            authUserRepository.getById.mockResolvedValue(
                Res.success({
                    id: 'user-1',
                    name: 'Gabriel',
                    email: 'g@e.com',
                    planId: 'plan-1',
                }),
            );
            const req = {
                user: {
                    sub: 'user-1',
                    engineer: true,
                    admin: false,
                    email: 'g@e.com',
                    name: 'Gabriel',
                },
            };
            const res = buildRes();

            await controller.validate(req, res);

            expect(res.json).toHaveBeenCalledWith({
                isEngineer: true,
                isAdmin: false,
                email: 'g@e.com',
                name: 'Gabriel',
                planId: 'plan-1',
            });
        });

        it('should omit planId when the user cannot be found', async () => {
            authUserRepository.getById.mockResolvedValue(
                Res.failure(new RepositoryNoDataFound('not found')),
            );
            const req = {
                user: {
                    sub: 'user-1',
                    engineer: false,
                    admin: false,
                    email: 'g@e.com',
                    name: 'Gabriel',
                },
            };
            const res = buildRes();

            await controller.validate(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ planId: undefined }),
            );
        });
    });

    describe('passwordRecovery', () => {
        it('should delegate to PasswordRecoveryUseCase', async () => {
            passwordRecoveryUseCase.execute.mockResolvedValue(
                Res.success(undefined),
            );

            const result = await controller.passwordRecovery({
                email: 'g@e.com',
            } as any);

            expect(passwordRecoveryUseCase.execute).toHaveBeenCalledWith({
                email: 'g@e.com',
            });
            expect(result.isSuccess()).toBe(true);
        });
    });

    describe('validateRecoveryToken', () => {
        it('should delegate to ValidateRecoveryTokenUseCase', async () => {
            validateRecoveryTokenUseCase.execute.mockResolvedValue(
                Res.success(undefined),
            );

            const result = await controller.validateRecoveryToken({
                email: 'g@e.com',
                token: '123456',
            } as any);

            expect(validateRecoveryTokenUseCase.execute).toHaveBeenCalledWith({
                email: 'g@e.com',
                token: '123456',
            });
            expect(result.isSuccess()).toBe(true);
        });
    });

    describe('changePassword', () => {
        it('should delegate to ChangePasswordUseCase', async () => {
            changePasswordUseCase.execute.mockResolvedValue(
                Res.success(undefined),
            );

            const result = await controller.changePassword({
                email: 'g@e.com',
                token: '123456',
                newPassword: 'NewPass@123',
            } as any);

            expect(changePasswordUseCase.execute).toHaveBeenCalledWith({
                email: 'g@e.com',
                token: '123456',
                newPassword: 'NewPass@123',
            });
            expect(result.isSuccess()).toBe(true);
        });
    });
});
