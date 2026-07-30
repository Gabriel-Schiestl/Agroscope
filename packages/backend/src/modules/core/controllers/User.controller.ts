import { Body, Controller, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'PublicRoutes';
import { ChangePlanDto, CreateUserDto } from '../application/dto/User.dto';
import { CreateUserUseCase } from '../application/usecases/user/CreateUser.usecase';
import { ChangeUserPlanUseCase } from '../application/usecases/user/ChangeUserPlan.usecase';

@Controller('user')
export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly changeUserPlanUseCase: ChangeUserPlanUseCase,
    ) {}

    @Public()
    @Post()
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
}
