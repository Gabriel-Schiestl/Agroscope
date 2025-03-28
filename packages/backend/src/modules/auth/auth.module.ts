import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { services } from './infra/services';
import { repositories } from './infra/repositories';
import { usecases } from './application/usecases';
import { mappers } from './infra/mappers';
import { CoreModule } from '../core/core.module';
import { AuthGuard } from './infra/services/Auth.guard';
import { AuthController } from './controllers/Auth.controller';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            signOptions: { expiresIn: '7d' },
            secret: process.env.JWT_SECRET,
        }),
        forwardRef(() => CoreModule),
    ],
    controllers: [AuthController],
    providers: [
        ...usecases,
        ...services,
        ...repositories,
        ...mappers,
        AuthGuard,
    ],
    exports: [...repositories, ...services],
})
export class AuthModule {}
