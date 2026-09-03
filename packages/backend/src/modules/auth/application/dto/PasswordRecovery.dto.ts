import { IsString } from 'class-validator';

export class PasswordRecoveryDto {
    @IsString()
    email: string;
}
