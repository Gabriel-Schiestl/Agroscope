import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';

config();

export const OrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
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
