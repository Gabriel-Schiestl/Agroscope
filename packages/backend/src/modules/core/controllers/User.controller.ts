import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../application/dto/User.dto';
import { CreateUserUseCase } from '../application/usecases/user/CreateUser.usecase';
import { Public } from 'PublicRoutes';

@Controller('user')
export class UserController {
    constructor(private readonly createUserCase: CreateUserUseCase) {}

    @Public()
    @Post()
    async createUser(@Body() user: CreateUserDto) {
        const result = await this.createUserCase.execute(user);

        return result;
    }
}
