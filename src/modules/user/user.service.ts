import { User, IUserDocument } from './user.model';
import { NotFoundError, BadRequestError } from '../../utils/app-error';
import { UpdateProfileInput, UserQueryParams } from './user.validation';
import { PaginationMeta } from '../../utils/api-response';

export class UserService {
  static async getProfile(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async updateProfile(userId: string, data: UpdateProfileInput): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.address) {
      user.address = {
        ...user.address,
        ...data.address,
      };
    }

    await user.save();
    return user;
  }

  static async getAllUsers(queryParams: UserQueryParams): Promise<{ users: IUserDocument[]; pagination: PaginationMeta }> {

    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive;
    }

    const [users, totalItems] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const pagination: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { users, pagination };
  }

  static async getUserById(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async setUserStatus(
    targetUserId: string,
    isActive: boolean,
    currentAdminId: string
  ): Promise<IUserDocument> {
    
    if (targetUserId === currentAdminId && !isActive) {
      throw new BadRequestError('Admin cannot deactivate their own account');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.isActive = isActive;
    await user.save();
    return user;
  }
}
