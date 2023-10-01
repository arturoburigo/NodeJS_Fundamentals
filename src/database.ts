import knex from 'knex';
import 'dotenv/config'
import { env } from './env';


if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL_ENV not Found')
}

export const config = {
    client: env.DATABASE_CLIENT,
    connection: env.DATABASE_CLIENT === 'sqlite' 
    ? {
        filename: env.DATABASE_URL
        }   
    : env.DATABASE_URL,
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './migrations'
    }
};

export const db = knex(config);
