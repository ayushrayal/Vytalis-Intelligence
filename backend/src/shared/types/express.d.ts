import { JwtAccessTokenPayload } from '../utils/jwt.util';

declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessTokenPayload;
    }
  }
}
