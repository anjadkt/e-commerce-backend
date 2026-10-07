import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/app-error';
import { UserRole } from '../modules/user/user.model';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    
    if (!req.user) {
      return next(new UnauthorizedError('Please authenticate first'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
