import { IUserDocument, UserRole } from '../modules/user/user.model';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
