import { IsString, IsOptional, Matches } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_MESSAGE = 'A senha deve conter ao menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos (@$!%*?&#)';

export class UserDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    planId?: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
    @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
    password: string;
}

export class UpdateUserDto extends OmitType(UserDto, ['id']) {
    @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
    password: string;
}
