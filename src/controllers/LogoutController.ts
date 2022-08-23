import { Controller, Middleware, Post } from '@overnightjs/core';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import { serverErrorResponse } from './errors';
import JWTR from 'jwt-redis';
import { createClient } from 'redis';
import verifyToken from '../middlewares/verifyToken';
import { JWT_SECRET } from '../config/config';
import { ISecureRequest } from '@overnightjs/jwt';

const { OK } = StatusCodes;

@Controller('logout')
export class LogoutController {
  @Post('')
  @Middleware([verifyToken])
  private async login(req: ISecureRequest, res: Response) {
    try {
      const client: any = createClient();
      await client.connect();
      const jwtr = new JWTR(client);

      const { jti } = req.payload;

      //deleting token from redis 
      jwtr.destroy(jti);

      return res.status(OK).json({
        success: true,
        message: 'Logout success!'
      });
    } catch (error) {
      logger.error(error);
      serverErrorResponse(res);
    }
  }
}
