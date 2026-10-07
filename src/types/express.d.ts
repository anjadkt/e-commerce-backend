import { IUserDocument } from '../modules/user/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
