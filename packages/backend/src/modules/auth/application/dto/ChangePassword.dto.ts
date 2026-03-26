import { IsString } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    email: string;

    @IsString()
    newPassword: string;

    @IsString()
    token: string;
}
