import { Controller, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database/db';
import { hashPassword } from '../utils/hashPassword';
import logger from '../config/logger';
import { serverErrorResponse } from './errors';

const { UNPROCESSABLE_ENTITY, UNAUTHORIZED, OK } = StatusCodes;

@Controller('signup')
export class SignUpController {
  @Post('')
  @Middleware([
    body('name', 'Name is less than 4 chars')
      .exists({ checkFalsy: true, checkNull: true })
      .isLength({ min: 3 }),
    body('email', 'Email is not valid!').exists({ checkFalsy: true, checkNull: true }).isEmail(),
    body(
      'password',
      'Password should contain Uppercase letter, Lowercase letters, numbers, special characters and should be 8 char long!'
    ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
  ])
  private async signup(req: Request, res: Response) {
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

      const { name, email, password, mobile } = req.body;

      const user = await db('users').where({ email: email }).select();

      if (user.length) {
        return res.status(UNAUTHORIZED).json({
          success: false,
          message: `User with email ${email} already present. Please try to sign in.`
        });
      }

      const [newUser] = await Promise.all([
        db('users').insert({
          email: email,
          password: hashPassword(password),
          name: name,
          mobileNumber: mobile || null
        })
      ]);

      const userData = await Promise.all([db('users').where({ userId: newUser }).select()]);

      return res.status(OK).json({
        success: true,
        message: 'User registered successfully! Please login to use our services.',
        data: userData
      });
    } catch (error) {
      logger.error(error);
      serverErrorResponse(res);
    }
  }
}
