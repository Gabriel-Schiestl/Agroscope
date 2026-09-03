import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer | undefined;

export async function startContainer(): Promise<StartedPostgreSqlContainer> {
    container = await new PostgreSqlContainer('postgres:15-alpine').start();

    return container;
}

export async function stopContainer(): Promise<void> {
    if (!container) return;

    await container.stop();
    container = undefined;
}
