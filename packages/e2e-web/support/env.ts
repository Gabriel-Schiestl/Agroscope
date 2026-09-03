import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const BASE_URL = process.env.BASE_URL ?? 'http://localhost';
export const API_PREFIX = '/api';

export const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgres://agroscope:agroscope@localhost:5433/agroscope_e2e';
