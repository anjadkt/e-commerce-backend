import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    return ApiResponse.created(res, 'User registered successfully', result);
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, 'Logged in successfully', result);
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    return ApiResponse.success(res, 'User profile retrieved', req.user);
  });
}
