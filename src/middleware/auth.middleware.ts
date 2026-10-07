import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/app-error';
import { User, UserRole } from '../modules/user/user.model';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);

    if (!token) {
      throw new UnauthorizedError('Authentication required. No access token provided.');
    }

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;

    const user = await User.findById(decoded.userId).select('_id role isActive');
    if (!user) {
      throw new UnauthorizedError('The user belonging to this token no longer exists');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
