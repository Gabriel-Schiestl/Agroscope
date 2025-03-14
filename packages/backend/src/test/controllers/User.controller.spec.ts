import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CreateUserUseCase } from 'src/modules/core/application/usecases/user/CreateUser.usecase';
import { UserController } from 'src/modules/core/controllers/User.controller';
import { CoreModule } from 'src/modules/core/core.module';
import { UserRole } from 'src/modules/core/domain/models/User';
import { Success } from 'src/shared/Result';
import { OrmConfig } from '../../../ormconfig';

describe('User controller integration tests', () => {
    let userController: UserController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [CreateUserUseCase],
            imports: [TypeOrmModule.forRoot(OrmConfig), CoreModule, AuthModule],
        }).compile();

        userController = app.get<UserController>(UserController);
    });

    it('should create a user', async () => {
        const result = await userController.createUser({
            name: 'Gabriel',
            email: 'teste@teste.com',
            password: '1234',
            role: UserRole.Admin,
        });

        expect(result).toBeInstanceOf(Success);

        if (result.isSuccess()) {
            expect(result.value).toBeUndefined();
        }
    });
});
