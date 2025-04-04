import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
    LoginUseCase,
    LoginUseCaseProps,
} from '../application/usecases/Login.usecase';
import { Response, Request } from 'express';
import { Public } from 'PublicRoutes';

@Controller('auth')
export class AuthController {
    constructor(private readonly loginUseCase: LoginUseCase) {}

    @Public()
    @Post('login')
    async login(@Body() body: LoginUseCaseProps, @Res() res: Response) {
        const result = await this.loginUseCase.execute(body);

        if (result.isSuccess()) {
            res.cookie('agroscope-authentication', result.value, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });
        }

        return res
            .status(result.isSuccess() ? 200 : 401)
            .json(result.isFailure() ? result.error : { token: result.value });
    }

    @Get('validate')
    async validate(@Req() req: any, @Res() res: Response) {
        const isEngineer: boolean = req.user?.engineer;

        return res.status(200).json({ isEngineer: isEngineer });
    }
}
