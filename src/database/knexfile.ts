import { Knex } from 'knex';
import { DB } from '../config/config';
import logger from '../config/logger';

const DB_CONFIG: Knex.Config = {
  client: 'mysql',
  connection: {
    host: DB.HOST,
    port: Number(DB.PORT),
    user: DB.USER,
    password: DB.PASSWORD,
    database: DB.NAME
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10,
    afterCreate: (conn: any, done: any) => {
      logger.debug('Database pool created');
      done();
    }
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: 'migrations'
  },
  debug: true,
  log: {
    debug({ bindings, sql }: any) {
      logger.debug(`RUNNING QUERY =  ${sql} ${bindings}`);
    }
  }
};

export default DB_CONFIG;
