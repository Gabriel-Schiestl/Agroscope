import { IsString } from 'class-validator';

export class ValidateRecoveryTokenDto {
    @IsString()
    email: string;

    @IsString()
    token: string;
}
