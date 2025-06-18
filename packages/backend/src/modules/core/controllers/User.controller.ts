import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'PublicRoutes';
import { CreateUserDto } from '../application/dto/User.dto';
import { CreateUserUseCase } from '../application/usecases/user/CreateUser.usecase';

@Controller('user')
export class UserController {
    constructor(private readonly createUserUseCase: CreateUserUseCase) {}

    @Public()
    @Post()
    async createUser(@Body() user: CreateUserDto) {
        const result = await this.createUserUseCase.execute(user);

        return result;
    }
}
