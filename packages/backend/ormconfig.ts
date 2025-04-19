import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';

config();

export const OrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DB_URL,
    ssl: process.env.DB_SSL === 'true',
    migrations: ['dist/src/modules/**/infra/migrations/**/*.{ts,js}'],
    entities: [
        path.join(__dirname, 'src/modules/**/infra/models/*.model.{js,ts}'),
    ],
    synchronize: false,
};

export const AppDataSource = new DataSource({
    ...OrmConfig,
    type: OrmConfig.type,
});
