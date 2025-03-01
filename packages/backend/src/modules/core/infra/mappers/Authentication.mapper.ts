import { Injectable } from '@nestjs/common';
import { Authentication } from '../../domain/models/Authentication';
import { AuthenticationModel } from '../models/Authentication.model';

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
            },
            authenticationModel.id,
        );
    }
}
