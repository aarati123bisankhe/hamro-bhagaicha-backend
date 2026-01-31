import detenv from 'dotenv';
detenv.config();

// Application level constants and config
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5050;

export const MONGODB_URL: string =
  process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/hamro_bhagaicha_backend';

export const JWT_SECRET: string =
  process.env.JWT_SECRET || 'mero_secret';





