import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateUserDto } from '../application/dto/User.dto';
import { CreateUserUseCase } from '../application/usecases/user/CreateUser.usecase';
import { Public } from 'PublicRoutes';
import { CreateEventUseCase } from '../../calendar/application/usecases/CreateEvent.usecase';

@Controller('user')
export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly createEventUseCase: CreateEventUseCase,
    ) {}

    @Public()
    @Post()
    async createUser(@Body() user: CreateUserDto) {
        const result = await this.createUserUseCase.execute(user);

        return result;
    }
}
