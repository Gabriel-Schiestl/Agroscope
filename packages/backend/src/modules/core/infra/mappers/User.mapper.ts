import { User } from '../../domain/models/User';
import { UserModel } from '../models/User.model';
import { LimitMapper } from './Limit.mapper';

export class UserMapper {
    static domainToModel(user: User): UserModel {
        return new UserModel().setProps({
            id: user.id,
            email: user.email,
            name: user.name,
            planId: user.planId,
            limit: LimitMapper.domainToModel(user.limit),
        });
    }

    static modelToDomain(user: UserModel): User {
        return User.load(
            {
                email: user.email,
                name: user.name,
                planId: user.planId,
                limit: LimitMapper.modelToDomain(user.limit),
            },
            user.id,
        );
    }
}
