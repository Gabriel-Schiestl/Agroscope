import { User } from 'src/modules/core/domain/models/User';
import { Failure, Success } from 'src/shared/Result';

describe('User domain model', () => {
    it('should create a new user', () => {
        const user = User.create({
            email: 'test@test',
            name: 'test',
        });

        expect(user).toBeInstanceOf(Success);
        expect(user.isSuccess() && user.value).toBeInstanceOf(User);
    });

    it('should return failure creating a new user', () => {
        const user = User.create({
            email: '',
            name: 'Test',
        });

        expect(user).toBeInstanceOf(Failure);
        expect(user.isFailure() && user.error.message).toBe(
            'Email is required',
        );
    });
});
