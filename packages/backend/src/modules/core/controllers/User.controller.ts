import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Patch,
    Post,
    Req,
    Res,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'PublicRoutes';
import {
    ChangePlanDto,
    CreateUserDto,
    UpdateProfileDto,
} from '../application/dto/User.dto';
import { CreateUserUseCase } from '../application/usecases/user/CreateUser.usecase';
import { ChangeUserPlanUseCase } from '../application/usecases/user/ChangeUserPlan.usecase';
import { UpdateUserProfileUseCase } from '../application/usecases/user/UpdateUserProfile.usecase';
import { DeleteUserUseCase } from '../application/usecases/user/DeleteUser.usecase';

const COOKIE_SECURE = process.env.COOKIE_SECURE !== 'false';

const validationPipe = new ValidationPipe({
    whitelist: true,
    exceptionFactory: (errors) => {
        const message = errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join(' ');
        return new BadRequestException(
            message || 'Dados inválidos. Verifique os campos preenchidos.',
        );
    },
});

@Controller('user')
export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly changeUserPlanUseCase: ChangeUserPlanUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) {}

    @Public()
    @Post()
    @UsePipes(validationPipe)
    async createUser(@Body() user: CreateUserDto) {
        const result = await this.createUserUseCase.execute(user);

        return result;
    }

    @Patch('plan')
    async changePlan(@Body() body: ChangePlanDto, @Req() req: Request) {
        return this.changeUserPlanUseCase.execute({
            userId: req['user'].sub,
            planId: body.planId,
        });
    }

    @Patch()
    @UsePipes(validationPipe)
    async updateProfile(@Body() body: UpdateProfileDto, @Req() req: Request) {
        return this.updateUserProfileUseCase.execute({
            userId: req['user'].sub,
            name: body.name,
        });
    }

    @Delete()
    async deleteAccount(@Req() req: Request, @Res() res: Response) {
        const result = await this.deleteUserUseCase.execute({
            userId: req['user'].sub,
        });

        if (result.isFailure()) {
            return res.status(400).json({ message: result.error.message });
        }

        res.clearCookie('agroscope-authentication', {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: COOKIE_SECURE ? 'none' : 'lax',
        });

        return res.status(200).json({ success: true });
    }
}
