import { env } from './env.config';

export const jwtConfig = {
  secret: env.jwtSecret,
  signOptions: { expiresIn: env.jwtExpiresIn },
};

export const jwtRefreshConfig = {
  secret: env.jwtRefreshSecret,
  signOptions: { expiresIn: env.jwtRefreshExpiresIn },
};