import { Controller, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database/db';
import { compareHash } from '../utils/hashPassword';
import logger from '../config/logger';
import { serverErrorResponse } from './errors';
import { JWT_EXPIRE, JWT_SECRET } from '../config/config';
import JWTR from 'jwt-redis';
import { createClient } from 'redis';

const { UNPROCESSABLE_ENTITY, UNAUTHORIZED, NOT_FOUND, OK } = StatusCodes;

@Controller('login')
export class LoginController {
  @Post('')
  @Middleware([
    body('email', 'Email is not valid!').exists({ checkFalsy: true, checkNull: true }).isEmail(),
    body(
      'password',
      'Password should contain Uppercase letter, Lowercase letters, numbers, special characters and should be 8 char long!'
    ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
  ])
  private async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(UNPROCESSABLE_ENTITY).json({
          success: false,
          code: -1,
          errors: errors.array(),
          message: 'Please check your inputs!'
        });
      }

      const { email, password } = req.body;

      const user = await db('users').where({ email: email }).select();

      if (!user.length) {
        return res.status(NOT_FOUND).json({
          success: false,
          message: 'No user found with this email'
        });
      }

      if (!compareHash(password, user[0].password)) {
        return res.status(UNAUTHORIZED).json({
          success: false,
          message: 'Email/Password does not match. Please retry.'
        });
      }

      const client: any = createClient();
      await client.connect();
      const jwtr = new JWTR(client);

      const token = await jwtr.sign(
        { email, userId: user[0].userId, name: user[0].name },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRE
        }
      );

      return res.status(OK).json({
        success: true,
        message: 'Login success!',
        token
      });
    } catch (error) {
      logger.error(error);
      serverErrorResponse(res);
    }
  }
}
