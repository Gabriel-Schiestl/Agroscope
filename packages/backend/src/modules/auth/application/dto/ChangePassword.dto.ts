import { IsString, Matches } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_MESSAGE = 'A senha deve conter ao menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos (@$!%*?&#)';

export class ChangePasswordDto {
    @IsString()
    email: string;

    @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
    newPassword: string;

    @IsString()
    token: string;
}
