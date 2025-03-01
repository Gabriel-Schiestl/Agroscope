import { IsString } from 'class-validator';
import { UserRole } from '../../domain/models/User';
import { OmitType } from '@nestjs/mapped-types';

export class UserDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    email: string;

    role: UserRole;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
    @IsString()
    password: string;
}

export class UpdateUserDto extends OmitType(UserDto, ['id']) {
    @IsString()
    password: string;
}
