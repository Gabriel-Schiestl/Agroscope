import { ChangePasswordUseCase } from './ChangePassword.usecase';
import { CreateAuthenticationUseCase } from './CreateAuthentication.usecase';
import { LoginUseCase } from './Login.usecase';
import { PasswordRecoveryUseCase } from './PasswordRecovery.usecase';
import { ValidateRecoveryTokenUseCase } from './ValidateRecoveryToken.usecase';

export const usecases = [
    LoginUseCase,
    PasswordRecoveryUseCase,
    ValidateRecoveryTokenUseCase,
    ChangePasswordUseCase,
    CreateAuthenticationUseCase,
];
