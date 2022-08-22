import dotenv from 'dotenv';

dotenv.config();

export const APP_PORT = Number(process.env.APP_PORT) || 8080;
export const JWT_SECRET = process.env.JWT_SECRET || 'somerandomkeyherena';
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const DB = {
  USER: process.env.DB_USER || 'root',
  PASSWORD: process.env.DB_USER_PWD || 'sanjeev',
  HOST: process.env.DB_HOST || 'localhost',
  PORT: process.env.DB_PORT || 3306,
  NAME: process.env.DB_NAME || 'coriyo'
};
