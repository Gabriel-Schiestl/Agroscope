import { Limit } from '../../../domain/models/Limit';
import { User } from '../../../domain/models/User';
import { LimitModel } from '../../models/Limit.model';
import { UserModel } from '../../models/User.model';
import { UserMapper } from '../User.mapper';

describe('UserMapper', () => {
    it('should map a User domain entity to a UserModel, wiring the limit relation', () => {
        const user = User.load(
            {
                name: 'Gabriel',
                email: 'gabriel@example.com',
                limit: Limit.load(
                    { imageRequests: 2, chatRequests: 4 },
                    'limit-1',
                ),
                planId: 'plan-1',
            },
            'user-1',
        );

        const model = UserMapper.domainToModel(user);

        expect(model).toBeInstanceOf(UserModel);
        expect(model.id).toBe('user-1');
        expect(model.email).toBe('gabriel@example.com');
        expect(model.planId).toBe('plan-1');
        expect(model.limit).toBeInstanceOf(LimitModel);
        expect(model.limit.imageRequests).toBe(2);
        expect(model.limit.user_relation).toBe(model);
    });

    it('should map a UserModel back to a User domain entity', () => {
        const limitModel = new LimitModel().setProps({
            id: 'limit-1',
            imageRequests: 2,
            chatRequests: 4,
        });
        const model = new UserModel().setProps({
            id: 'user-1',
            name: 'Gabriel',
            email: 'gabriel@example.com',
            planId: 'plan-1',
            limit: limitModel,
        });

        const user = UserMapper.modelToDomain(model);

        expect(user).toBeInstanceOf(User);
        expect(user.id).toBe('user-1');
        expect(user.email).toBe('gabriel@example.com');
        expect(user.limit).toBeInstanceOf(Limit);
        expect(user.limit.imageRequests).toBe(2);
    });
});
