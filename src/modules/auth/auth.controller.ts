import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { UnauthorizedError } from '../../utils/app-error';
import { setAuthCookies, clearAuthCookies } from './cookies';

export class AuthController {
  
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await AuthService.register(req.body);
    setAuthCookies(res, tokens);
    return ApiResponse.created(res, 'User registered successfully', { user, tokens });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await AuthService.login(req.body);
    setAuthCookies(res, tokens);
    return ApiResponse.success(res, 'Logged in successfully', { user, tokens });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing in cookies');
    }

    const tokens = await AuthService.refresh(refreshToken);
    setAuthCookies(res, tokens);
    return ApiResponse.success(res, 'Tokens refreshed successfully', { tokens });
  });

  static logout = asyncHandler(async (_req: Request, res: Response) => {
    clearAuthCookies(res);
    return ApiResponse.success(res, 'Logged out successfully');
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    return ApiResponse.success(res, 'User profile retrieved', req.user);
  });
}
