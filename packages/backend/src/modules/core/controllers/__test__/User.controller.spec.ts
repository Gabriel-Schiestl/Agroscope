import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { UserController } from '../User.controller';
import { CreateUserUseCase } from '../../application/usecases/user/CreateUser.usecase';
import { ChangeUserPlanUseCase } from '../../application/usecases/user/ChangeUserPlan.usecase';
import { UpdateUserProfileUseCase } from '../../application/usecases/user/UpdateUserProfile.usecase';
import { DeleteUserUseCase } from '../../application/usecases/user/DeleteUser.usecase';

describe('UserController', () => {
    const createUserUseCase = {
        execute: jest.fn(),
    } as unknown as CreateUserUseCase;

    const changeUserPlanUseCase = {
        execute: jest.fn(),
    } as unknown as ChangeUserPlanUseCase;

    const updateUserProfileUseCase = {
        execute: jest.fn(),
    } as unknown as UpdateUserProfileUseCase;

    const deleteUserUseCase = {
        execute: jest.fn(),
    } as unknown as DeleteUserUseCase;

    let controller: UserController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new UserController(
            createUserUseCase,
            changeUserPlanUseCase,
            updateUserProfileUseCase,
            deleteUserUseCase,
        );
    });

    describe('createUser', () => {
        it('should delegate to CreateUserUseCase and return its result', async () => {
            const dto = {
                name: 'Gabriel',
                email: 'teste@teste.com',
                password: 'Teste@1234',
                acceptedTerms: true,
            };
            (createUserUseCase.execute as jest.Mock).mockResolvedValue(
                Res.success(undefined),
            );

            const result = await controller.createUser(dto as any);

            expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);
            expect(result.isSuccess()).toBe(true);
        });

        it('should propagate a failure from CreateUserUseCase', async () => {
            const dto = {
                name: 'Gabriel',
                email: 'teste@teste.com',
                password: 'Teste@1234',
                acceptedTerms: true,
            };
            const error = new BusinessException(
                'O e-mail e senha não conferem',
            );
            (createUserUseCase.execute as jest.Mock).mockResolvedValue(
                Res.failure(error),
            );

            const result = await controller.createUser(dto as any);

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBe(error);
        });
    });

    describe('changePlan', () => {
        it('should call ChangeUserPlanUseCase with userId from the request and planId from the body', async () => {
            (changeUserPlanUseCase.execute as jest.Mock).mockResolvedValue(
                Res.success(undefined),
            );
            const req = { user: { sub: 'user-1' } } as any;

            const result = await controller.changePlan(
                { planId: 'plan-1' } as any,
                req,
            );

            expect(changeUserPlanUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-1',
                planId: 'plan-1',
            });
            expect(result.isSuccess()).toBe(true);
        });
    });

    describe('updateProfile', () => {
        it('should call UpdateUserProfileUseCase with userId from the request', async () => {
            (updateUserProfileUseCase.execute as jest.Mock).mockResolvedValue(
                Res.success({ name: 'Maria Silva', email: 'maria@email.com' }),
            );
            const req = { user: { sub: 'user-1' } } as any;

            const result = await controller.updateProfile(
                { name: 'maria silva' },
                req,
            );

            expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-1',
                name: 'maria silva',
            });
            expect(result.isSuccess()).toBe(true);
        });
    });

    describe('deleteAccount', () => {
        const buildRes = () => {
            const res: any = {};
            res.status = jest.fn().mockReturnValue(res);
            res.json = jest.fn().mockReturnValue(res);
            res.clearCookie = jest.fn().mockReturnValue(res);
            return res;
        };

        it('should delete the account and clear the auth cookie', async () => {
            (deleteUserUseCase.execute as jest.Mock).mockResolvedValue(
                Res.success(undefined),
            );
            const res = buildRes();

            await controller.deleteAccount(
                { user: { sub: 'user-1' } } as any,
                res,
            );

            expect(deleteUserUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-1',
            });
            expect(res.clearCookie).toHaveBeenCalledWith(
                'agroscope-authentication',
                expect.any(Object),
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should keep the cookie and return 400 when deletion fails', async () => {
            (deleteUserUseCase.execute as jest.Mock).mockResolvedValue(
                Res.failure(new BusinessException('falhou')),
            );
            const res = buildRes();

            await controller.deleteAccount(
                { user: { sub: 'user-1' } } as any,
                res,
            );

            expect(res.clearCookie).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
