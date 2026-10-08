import { Request, Response } from 'express';
import { UserService } from './user.service';
import { UserMapper } from './user.mapper';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class UserController {
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getProfile(req.user!._id.toString());
    return ApiResponse.success(res, 'User profile retrieved', user);
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const updatedUser = await UserService.updateProfile(req.user!._id.toString(), req.body);
    return ApiResponse.success(res, 'Profile updated successfully', updatedUser);
  });

  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { users, pagination } = await UserService.getAllUsers(req.query as any);
    const mappedUsers = UserMapper.toAdminResponseList(users);
    return ApiResponse.success(res, 'Users retrieved successfully', mappedUsers, 200, pagination);
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await UserService.getUserById(id);
    const mappedUser = UserMapper.toAdminResponse(user);
    return ApiResponse.success(res, 'User retrieved successfully', mappedUser);
  });

  static toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const updatedUser = await UserService.setUserStatus(
      id,
      req.body.isActive,
      req.user!._id.toString()
    );
    const mappedUser = UserMapper.toAdminResponse(updatedUser);
    return ApiResponse.success(
      res,
      `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      mappedUser
    );
  });
}

