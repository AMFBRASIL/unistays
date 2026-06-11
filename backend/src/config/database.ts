import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'unistays',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [path.join(__dirname, '../entities/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../database/migrations/**/*{.ts,.js}')],
  subscribers: [path.join(__dirname, '../database/subscribers/**/*{.ts,.js}')],
  charset: 'utf8mb4',
  timezone: 'Z',
  extra: {
    connectionLimit: 10,
    charset: 'utf8mb4',
    // Reduz ECONNRESET: mantém conexões vivas e evita uso de conexões já fechadas pelo MySQL
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 60000,
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);
