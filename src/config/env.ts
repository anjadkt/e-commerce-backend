import dotenv from 'dotenv';

dotenv.config();

export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Environment variable '${key}' is missing or empty`);
  }
  return value;
};

export const env = {
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  MONGODB_URI: getEnv('MONGODB_URI'),
  ACCESS_TOKEN_SECRET: getEnv('ACCESS_TOKEN_SECRET'),
  ACCESS_TOKEN_EXPIRES_IN: getEnv('ACCESS_TOKEN_EXPIRES_IN', '15m'),
  REFRESH_TOKEN_SECRET: getEnv('REFRESH_TOKEN_SECRET'),
  REFRESH_TOKEN_EXPIRES_IN: getEnv('REFRESH_TOKEN_EXPIRES_IN', '7d'),
};
