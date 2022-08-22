import knex from 'knex';
import DB_CONFIG from './knexfile';

export const db = knex(DB_CONFIG);
