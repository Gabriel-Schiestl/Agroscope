import { config } from 'dotenv';
import { startContainer } from './postgres-container';

export default async function globalSetup(): Promise<void> {
    config();

    const container = await startContainer();

    process.env.DB_URL = container.getConnectionUri();
    process.env.DB_SSL = 'false';

    const { AppDataSource } = await import('../../ormconfig');

    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    await AppDataSource.destroy();
}
