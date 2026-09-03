import { Limit } from '../../../domain/models/Limit';
import { User } from '../../../domain/models/User';
import { UserAppMapper } from '../User.mapper';

describe('UserAppMapper', () => {
    it('should map a User domain entity to a UserDto', () => {
        const user = User.load(
            {
                name: 'Gabriel',
                email: 'gabriel@example.com',
                limit: Limit.create(),
                planId: 'plan-1',
            },
            'user-1',
        );

        const dto = UserAppMapper.toDto(user);

        expect(dto).toEqual({
            id: 'user-1',
            name: 'Gabriel',
            email: 'gabriel@example.com',
            planId: 'plan-1',
        });
    });
});
