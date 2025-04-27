import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
    LoginUseCase,
    LoginUseCaseProps,
} from '../application/usecases/Login.usecase';
import { Response, Request } from 'express';
import { Public } from 'PublicRoutes';
import { minutes, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private readonly loginUseCase: LoginUseCase) {}

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
        return res
            .status(200)
            .json({
                isEngineer: req.user.isEngineer,
                isAdmin: req.user.isAdmin,
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
}
