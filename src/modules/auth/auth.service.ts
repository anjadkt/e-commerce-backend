import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
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

  static async register(input: RegisterInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, env.SALT_ROUNDS);

    const user = new User({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      phone: input.phone,
      role: 'customer',
      isActive: true,
    });

    await user.save();
    const tokens = AuthService.generateTokens(user);

    const safeUser: SafeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return { user: safeUser, tokens };
  }

  static async login(input: LoginInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password || '');
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }

    const tokens = AuthService.generateTokens(user);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      tokens
    };
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
