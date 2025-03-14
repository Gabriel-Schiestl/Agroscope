import { IsString } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

export class UserDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    email: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
    @IsString()
    password: string;
}

export class UpdateUserDto extends OmitType(UserDto, ['id']) {
    @IsString()
    password: string;
}
