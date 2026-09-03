import { INestApplication } from '@nestjs/common';
import { User } from 'src/modules/core/domain/models/User';
import { Authentication } from 'src/modules/auth/domain/models/Authentication';
import { Plan } from 'src/modules/core/domain/models/Plan';
import { PlanMapper } from 'src/modules/core/infra/mappers/Plan.mapper';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { EncryptionService } from 'src/modules/auth/domain/services/Encryption.service';

export interface SeedUserOptions {
    name?: string;
    email: string;
    password: string;
    termsVersion?: string;
    planId?: string;
}

export async function seedUserWithAuthentication(
    app: INestApplication,
    options: SeedUserOptions,
): Promise<{ user: User; authentication: Authentication }> {
    const userRepository = app.get<UserRepository>('UserRepository');
    const authenticationRepository = app.get<AuthenticationRepository>(
        'AuthenticationRepository',
    );
    const encryptionService = app.get<EncryptionService>('EncryptionService');

    const user = User.create({
        name: options.name ?? 'Integration Test User',
        email: options.email,
        acceptedTerms: true,
        termsVersion: options.termsVersion ?? '2026-08-01',
        planId: options.planId,
    });
    if (user.isFailure()) throw user.error;
    const savedUser = await userRepository.save(user.value);
    if (savedUser.isFailure()) throw savedUser.error;

    const hashedPassword = await encryptionService.encrypt(options.password);
    const authentication = Authentication.create({
        email: options.email,
        password: hashedPassword,
    });
    if (authentication.isFailure()) throw authentication.error;
    const savedAuthentication = await authenticationRepository.save(
        authentication.value,
    );
    if (savedAuthentication.isFailure()) throw savedAuthentication.error;

    return { user: user.value, authentication: authentication.value };
}

export interface SeedPlanOptions {
    type: string;
    imageLimit?: number;
    chatLimit?: number;
    features?: string[];
    featureFlags?: string[];
    price?: number;
}

export async function seedPlan(
    app: INestApplication,
    options: SeedPlanOptions,
): Promise<Plan> {
    const plan = Plan.create({
        type: options.type,
        imageLimit: options.imageLimit ?? 10,
        chatLimit: options.chatLimit ?? 10,
        features: options.features ?? [],
        featureFlags: options.featureFlags ?? [],
        price: options.price ?? 0,
    });
    if (plan.isFailure()) throw plan.error;

    // PlanRepository has no `save`: plans are managed exclusively via
    // migrations in this app, so tests seed them through the ORM model.
    await PlanMapper.domainToModel(plan.value).save();

    return plan.value;
}
