import { Injectable } from '@nestjs/common';
import { Authentication } from '../../../auth/domain/models/Authentication';
import { AuthenticationModel } from '../../../auth/infra/models/Authentication.model';

@Injectable()
export class AuthenticationMapper {
    domainToModel(authentication: Authentication): AuthenticationModel {
        return new AuthenticationModel().setProps({
            id: authentication.id,
            email: authentication.email,
            password: authentication.password,
            lastLogin: authentication.lastLogin,
            recoveryCode: authentication.recoveryCode,
            recoveryCodeExpiration: authentication.recoveryCodeExpiration,
            incorrectPasswordAttempts: authentication.incorrectPasswordAttempts,
            incorrectRecoveryAttempts: authentication.incorrectRecoveryAttempts,
        });
    }

    modelToDomain(authenticationModel: AuthenticationModel): Authentication {
        return Authentication.load(
            {
                email: authenticationModel.email,
                password: authenticationModel.password,
                lastLogin: authenticationModel.lastLogin,
                recoveryCode: authenticationModel.recoveryCode,
                recoveryCodeExpiration:
                    authenticationModel.recoveryCodeExpiration,
                incorrectPasswordAttempts:
                    authenticationModel.incorrectPasswordAttempts,
                incorrectRecoveryAttempts:
                    authenticationModel.incorrectRecoveryAttempts,
            },
            authenticationModel.id,
        );
    }
}
