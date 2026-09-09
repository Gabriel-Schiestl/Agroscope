import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { minutes, Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from 'PublicRoutes';
import { ChangePasswordUseCase } from '../application/usecases/ChangePassword.usecase';
import {
    LoginUseCase,
    LoginUseCaseProps,
} from '../application/usecases/Login.usecase';
import { PasswordRecoveryUseCase } from '../application/usecases/PasswordRecovery.usecase';
import { ValidateRecoveryTokenUseCase } from '../application/usecases/ValidateRecoveryToken.usecase';
import { PasswordRecoveryDto } from '../application/dto/PasswordRecovery.dto';
import { ValidateRecoveryTokenDto } from '../application/dto/ValidateRecoveryToken.dto';
import { ChangePasswordDto } from '../application/dto/ChangePassword.dto';
import { AuthUserRepository } from '../domain/repositories/AuthUser.repository';

const COOKIE_SECURE = process.env.COOKIE_SECURE !== 'false';

const AUTH_THROTTLE_LIMIT = process.env.THROTTLE_LOGIN_LIMIT
    ? Number(process.env.THROTTLE_LOGIN_LIMIT)
    : 10;

@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly passwordRecoveryUseCase: PasswordRecoveryUseCase,
        private readonly validateRecoveryTokenUseCase: ValidateRecoveryTokenUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        @Inject('AuthUserRepository')
        private readonly authUserRepository: AuthUserRepository,
    ) {}

    @Public()
    @Throttle({ medium: { limit: AUTH_THROTTLE_LIMIT, ttl: minutes(1) } })
    @Post('login')
    async login(@Body() body: LoginUseCaseProps, @Res() res: Response) {
        const result = await this.loginUseCase.execute(body);

        if (result.isSuccess()) {
            res.cookie('agroscope-authentication', result.value, {
                httpOnly: true,
                secure: COOKIE_SECURE,
                sameSite: COOKIE_SECURE ? 'none' : 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
        }

        return res
            .status(result.isSuccess() ? 200 : 401)
            .json(result.isFailure() ? result.error : { token: result.value });
    }

    @Public()
    @Post('logout')
    async logout(@Res() res: Response) {
        res.clearCookie('agroscope-authentication', {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: COOKIE_SECURE ? 'none' : 'lax',
        });

        return res.status(200).json({ success: true });
    }

    @Get('validate')
    async validate(@Req() req: any, @Res() res: Response) {
        const user = await this.authUserRepository.getById(req.user.sub);

        return res.status(200).json({
            isEngineer: req.user.engineer,
            isAdmin: req.user.admin,
            email: req.user.email,
            name: req.user.name,
            planId: user.isSuccess() ? user.value.planId : undefined,
        });
    }

    @Public()
    @Throttle({ medium: { limit: AUTH_THROTTLE_LIMIT, ttl: minutes(1) } })
    @Post('recovery-token')
    async passwordRecovery(@Body() body: PasswordRecoveryDto) {
        const result = await this.passwordRecoveryUseCase.execute({
            email: body.email,
        });

        return result;
    }

    @Public()
    @Post('validate-recovery-token')
    async validateRecoveryToken(@Body() body: ValidateRecoveryTokenDto) {
        const result = await this.validateRecoveryTokenUseCase.execute({
            email: body.email,
            token: body.token,
        });

        return result;
    }

    @Public()
    @Post('change-password')
    async changePassword(@Body() body: ChangePasswordDto) {
        const result = await this.changePasswordUseCase.execute({
            email: body.email,
            token: body.token,
            newPassword: body.newPassword,
        });

        return result;
    }
}
