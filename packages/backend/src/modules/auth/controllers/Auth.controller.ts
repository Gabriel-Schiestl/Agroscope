import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { minutes, Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from 'PublicRoutes';
import { ChangePasswordUseCase } from '../application/usecases/ChangePassword.usecase';
import { CreateAuthenticationUseCase } from '../application/usecases/CreateAuthentication.usecase';
import {
    LoginUseCase,
    LoginUseCaseProps,
} from '../application/usecases/Login.usecase';
import { PasswordRecoveryUseCase } from '../application/usecases/PasswordRecovery.usecase';
import { ValidateRecoveryTokenUseCase } from '../application/usecases/ValidateRecoveryToken.usecase';
import { UserDto } from '../application/dto/User.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly passwordRecoveryUseCase: PasswordRecoveryUseCase,
        private readonly validateRecoveryTokenUseCase: ValidateRecoveryTokenUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly createAuthenticationUseCase: CreateAuthenticationUseCase,
    ) {}

    @Public()
    @Throttle({ medium: { limit: 10, ttl: minutes(1) } })
    @Post('login')
    async login(@Body() body: LoginUseCaseProps, @Res() res: Response) {
        const result = await this.loginUseCase.execute(body);

        if (result.isSuccess()) {
            res.cookie('agroscope-authentication', result.value, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
        }

        return res
            .status(result.isSuccess() ? 200 : 401)
            .json(result.isFailure() ? result.error : { token: result.value });
    }

    @Get('validate')
    async validate(@Req() req: any, @Res() res: Response) {
        return res.status(200).json({
            isEngineer: req.user.engineer,
            isAdmin: req.user.admin,
            email: req.user.email,
            name: req.user.name,
        });
    }

    @Public()
    @Get('csrf/token')
    getCsrfToken(@Req() req: Request, @Res() res: Response) {
        const csrfToken = req.csrfToken();
        res.json({ csrfToken });
    }

    @Public()
    @Post('recovery-token')
    async passwordRecovery(@Body() body: { email: string }) {
        const result = await this.passwordRecoveryUseCase.execute({
            email: body.email,
        });

        return result;
    }

    @Public()
    @Post('validate-recovery-token')
    async validateRecoveryToken(
        @Body() body: { email: string; token: string },
    ) {
        const result = await this.validateRecoveryTokenUseCase.execute({
            email: body.email,
            token: body.token,
        });

        return result;
    }

    @Public()
    @Post('change-password')
    async changePassword(
        @Body() body: { email: string; newPassword: string; token: string },
    ) {
        const result = await this.changePasswordUseCase.execute({
            email: body.email,
            token: body.token,
            newPassword: body.newPassword,
        });

        return result;
    }

    @OnEvent('user.created')
    async createCalendar(user: UserDto) {
        const result = await this.createAuthenticationUseCase.execute({
            email: user.email,
            password: user.password,
        });

        return result;
    }
}
