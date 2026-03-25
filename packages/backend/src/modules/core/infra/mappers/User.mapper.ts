import { User } from '../../domain/models/User';
import { UserModel } from '../models/User.model';

export class UserMapper {
    static domainToModel(user: User): UserModel {
        return new UserModel().setProps({
            id: user.id,
            email: user.email,
            name: user.name,
            planId: user.planId,
        });
    }

    static modelToDomain(user: UserModel): User {
        return User.load(
            {
                email: user.email,
                name: user.name,
                planId: user.planId,
            },
            user.id,
        );
    }
}
