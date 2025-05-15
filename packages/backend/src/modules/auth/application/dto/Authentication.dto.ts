import { IsString } from 'class-validator';

export class AuthenticationDto {
    @IsString()
    email: string;

    @IsString()
    password: string;
}
