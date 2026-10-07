import { Response, CookieOptions } from 'express';
import { AuthTokens } from './auth.service';
import { env } from '../../config/env';

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const setAuthCookies = (res: Response, tokens: AuthTokens): void => {
  res.cookie('access_token', tokens.accessToken, getAccessTokenCookieOptions());
  res.cookie('refresh_token', tokens.refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response): void => {
  const clearOptions: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  res.clearCookie('access_token', clearOptions);
  res.clearCookie('refresh_token', clearOptions);
};
