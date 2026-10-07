import jwt from 'jsonwebtoken';
import { User, IUserDocument, UserRole } from '../user/user.model';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../utils/app-error';
import { RegisterInput, LoginInput } from './auth.validation';

interface TokenPayload {
  userId: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static generateTokens(user: IUserDocument): AuthTokens {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  static async register(input: RegisterInput): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const user = new User({
      ...input,
      email: input.email.toLowerCase(),
      role: input.role || 'customer',
      isActive: true,
    });

    await user.save();
    const tokens = AuthService.generateTokens(user);

    return { user, tokens };
  }

  static async login(input: LoginInput): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
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

    const tokens = AuthService.generateTokens(user);

    const userJson = user.toJSON();
    return { user: userJson as any, tokens };
  }

  static async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as TokenPayload;

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('The user belonging to this token no longer exists');
      }

      if (!user.isActive) {
        throw new ForbiddenError('Your account has been deactivated. Please contact an administrator.');
      }

      return AuthService.generateTokens(user);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Refresh token has expired. Please log in again.');
      }
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}
