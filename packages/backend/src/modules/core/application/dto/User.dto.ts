import {
    IsString,
    IsOptional,
    Matches,
    IsBoolean,
    Equals,
    IsEmail,
    MinLength,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_MESSAGE =
    'A senha deve conter ao menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos (@$!%*?&#)';
const EMAIL_MESSAGE = 'Informe um e-mail válido.';
const NAME_MESSAGE = 'Informe seu nome completo.';

export class UserDto {
    @IsString()
    id: string;

    @IsString()
    @MinLength(2, { message: NAME_MESSAGE })
    name: string;

    @IsEmail({}, { message: EMAIL_MESSAGE })
    email: string;

    @IsOptional()
    @IsString()
    planId?: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
    @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
    password: string;

    @IsBoolean()
    @Equals(true, {
        message:
            'É necessário aceitar os termos de uso e a política de privacidade para criar uma conta',
    })
    acceptedTerms: boolean;
}

export class UpdateUserDto extends OmitType(UserDto, ['id']) {
    @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
    password: string;
}

export class ChangePlanDto {
    @IsString()
    planId: string;
}
