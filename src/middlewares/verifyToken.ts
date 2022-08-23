import { Response, NextFunction } from 'express';
import { ISecureRequest } from '@overnightjs/jwt';
import statusCodes from 'http-status-codes';
import JWTR from 'jwt-redis';
import { createClient } from 'redis';
import { JWT_SECRET } from '../config/config';

const send401WithMessage = (res: Response) => {
  res.status(statusCodes.UNAUTHORIZED).send({
    message: 'You are not authorized to use this service'
  });
};

export default async function verifyToken(req: ISecureRequest, res: Response, next: NextFunction) {
  const client: any = createClient();
  await client.connect();
  const jwtr = new JWTR(client);

  const authorizationHeader: string = req.headers.authorization ?? ('' as string);

  const parts = authorizationHeader.split(' ');

  if (parts.length === 2) {
    const token = parts[1];
    if (!token) {
      return send401WithMessage(res);
    }
    jwtr
      .verify(token, JWT_SECRET)
      .then((payload: any) => {
        const { userId, jti } = payload;
        req.payload = {};
        req.payload.userID = userId;
        req.payload.jti = jti;
        next();
      })
      .catch((err) => {
        return send401WithMessage(res);
      });
  } else {
    return send401WithMessage(res);
  }
}
