import { CreateUserUseCase } from './CreateUser.usecase';
import { ChangeUserPlanUseCase } from './ChangeUserPlan.usecase';
import { UpdateUserProfileUseCase } from './UpdateUserProfile.usecase';
import { DeleteUserUseCase } from './DeleteUser.usecase';

export const userUseCases = [
    CreateUserUseCase,
    ChangeUserPlanUseCase,
    UpdateUserProfileUseCase,
    DeleteUserUseCase,
];
