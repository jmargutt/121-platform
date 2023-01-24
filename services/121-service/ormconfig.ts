import { DataSourceOptions } from 'typeorm';

export const ORMConfig: DataSourceOptions = {
  type: 'postgres',
  host: '121db',
  port: 5432,
  username: process.env.ORMCONFIG_121_SERVICE_USERNAME,
  password: process.env.ORMCONFIG_121_SERVICE_PASSWORD,
  database: 'global121',
  schema: '121-service',
  entities: ['src/**/**.entity.ts'],
  subscribers: ['src/**/**.subscriber.ts'],
  migrationsTableName: 'custom_migration_table',
  migrations: ['migration/*.ts'],
  dropSchema: false,
  synchronize: false,
};
