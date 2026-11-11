import { INestApplication } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

type InMemoryThrottlerStorage = ThrottlerStorage & {
    storage: Map<string, unknown>;
    onApplicationShutdown(): void;
};

export function resetRateLimit(app: INestApplication): void {
    const storage = app.get(ThrottlerStorage) as InMemoryThrottlerStorage;
    storage.onApplicationShutdown();
    storage.storage.clear();
}
