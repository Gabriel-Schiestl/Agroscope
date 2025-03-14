import { User } from '../../domain/models/User';
import { UserDto } from '../dto/User.dto';

export class UserAppMapper {
    static toDto(user: User): UserDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }
}
