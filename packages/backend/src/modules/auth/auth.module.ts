import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { services } from './infra/services';
import { repositories } from './infra/repositories';
import { usecases } from './application/usecases';
import { mappers } from './infra/mappers';
import { CoreModule } from '../core/core.module';
import { AuthGuard } from './infra/services/Auth.guard';
import { AuthController } from './controllers/Auth.controller';
import { EngineerModule } from '../engineer/engineer.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            signOptions: { expiresIn: '7d' },
            secret: process.env.JWT_SECRET,
        }),
        forwardRef(() => CoreModule),
        EngineerModule,
        SharedModule,
    ],
    controllers: [AuthController],
    providers: [
        ...usecases,
        ...services,
        ...repositories,
        ...mappers,
        AuthGuard,
        {
            provide: 'AES_KEY',
            useValue: process.env.AES_KEY,
        },
    ],
    exports: [...repositories, ...services],
})
export class AuthModule {}
