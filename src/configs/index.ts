import detenv from 'dotenv';
detenv.config();

//application level constant and config
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5050 ;
// if port is not defined in .env, use 5050 as default
export const MONGODB_URL: string =
process.env.MONGODB_URL || 'mangodb://localhost:27010/default_db';
// if mangobo_url is nor defined in

export const JWT_SECRET: string =
process.env.JWT_SECRET || 'mero_secret';

