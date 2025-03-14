import { Injectable } from '@nestjs/common';
import { User } from '../../domain/models/User';
import { UserModel } from '../models/User.model';

@Injectable()
export class UserMapper {
    domainToModel(user: User): UserModel {
        return new UserModel().setProps({
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }

    modelToDomain(user: UserModel): User {
        return User.load(
            {
                email: user.email,
                name: user.name,
            },
            user.id,
        );
    }
}
