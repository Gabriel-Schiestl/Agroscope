import {
    IsString,
    IsOptional,
    Matches,
    IsBoolean,
    Equals,
    IsEmail,
    MinLength,
    MaxLength,
    ValidateBy,
    ValidationOptions,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
    formatPersonName,
    INSTITUTIONAL_EMAIL_MESSAGE,
    isInstitutionalEmail,
    NAME_LENGTH_MESSAGE,
    NAME_MAX_LENGTH,
} from '../../domain/models/UserProfileRules';
import { OmitType } from '@nestjs/mapped-types';

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_MESSAGE =
    'A senha deve conter ao menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos (@$!%*?&#)';
const EMAIL_MESSAGE = 'Informe um e-mail válido.';
const NAME_MESSAGE = 'Informe seu nome completo.';

function IsPersonalEmail(options?: ValidationOptions) {
    return ValidateBy(
        {
            name: 'isPersonalEmail',
            validator: {
                validate: (value) =>
                    typeof value === 'string' && !isInstitutionalEmail(value),
                defaultMessage: () => INSTITUTIONAL_EMAIL_MESSAGE,
            },
        },
        options,
    );
}

const formatName = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? formatPersonName(value) : value;

export class UserDto {
    @IsString()
    id: string;

    @Transform(formatName)
    @IsString()
    @MinLength(2, { message: NAME_MESSAGE })
    @MaxLength(NAME_MAX_LENGTH, { message: NAME_LENGTH_MESSAGE })
    name: string;

    @IsEmail({}, { message: EMAIL_MESSAGE })
    @IsPersonalEmail()
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

    @IsOptional()
    @IsBoolean()
    acceptedImageTraining?: boolean;
}

export class UpdateUserDto extends OmitType(UserDto, ['id']) {
    @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
    password: string;
}

export class UpdateProfileDto {
    @Transform(formatName)
    @IsString()
    @MinLength(2, { message: NAME_MESSAGE })
    @MaxLength(NAME_MAX_LENGTH, { message: NAME_LENGTH_MESSAGE })
    name: string;
}

export class ChangePlanDto {
    @IsString()
    planId: string;
}
