import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../user/user.model';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError } from '../../utils/app-error';
import { RegisterInput, LoginInput } from './auth.validation';

export class AuthService {
  static generateToken(user: IUserDocument): string {
    return jwt.sign(
      { userId: user._id.toString(), role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  static async register(input: RegisterInput): Promise<{ user: IUserDocument; token: string }> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const user = new User({
      ...input,
      email: input.email.toLowerCase(),
      // Default to customer unless explicitly allowed or configured
      role: input.role || 'customer',
      isActive: true,
    });

    await user.save();
    const token = AuthService.generateToken(user);

    return { user, token };
  }

  static async login(input: LoginInput): Promise<{ user: IUserDocument; token: string }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }

    const token = AuthService.generateToken(user);

    // Remove password before returning
    const userJson = user.toJSON();
    return { user: userJson as any, token };
  }
}
