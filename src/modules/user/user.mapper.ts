import { IUserDocument, IUserAddress, UserRole } from './user.model';

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  address?: IUserAddress;
  createdAt: Date;
  updatedAt: Date;
}

export class UserMapper {
  
  static toAdminResponse(user: IUserDocument): AdminUserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toAdminResponseList(users: IUserDocument[]): AdminUserResponse[] {
    return users.map((user) => this.toAdminResponse(user));
  }
}
