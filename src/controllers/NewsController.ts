import { Controller, Get, Middleware } from '@overnightjs/core';
import { ISecureRequest } from '@overnightjs/jwt';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import { serverErrorResponse } from './errors';
import { asyncWrap } from '../utils/asyncWrap';
import axios from 'axios';
import verifyToken from '../middlewares/verifyToken';
import cacheData from '../redis/cacheData';
import getCache from '../redis/getCache';

const { OK } = StatusCodes;

@Controller('news')
export class NewsController {
  @Get('')
  @Middleware([verifyToken])
  private async weatherData(req: ISecureRequest, res: Response) {
    try {
      const API_KEY = process.env.NEWSAPIKEY;
      const { search } = req.query;

      // getting cache data
      const cachedData = await getCache('news', `${search || 'bitcoin'}`);
      if (cachedData !== null) {
        let result = JSON.parse(cachedData);
        // logger.info('response from cache');
        return res.status(OK).json(result);
      }

      const url = `https://newsapi.org/v2/everything?q=${search || 'bitcoin'}&apiKey=${API_KEY}`;

      const [error, result] = await asyncWrap(axios.get(url));
      if (error) {
        logger.error(error);
        serverErrorResponse(res);
      }

      const response: any = { count: result.data.articles.length };

      const data = result.data.articles.map((item: any) => ({
        headline: item.title,
        link: item.url,
        content: item.content
      }));

      response.data = data;
      // logger.info('return from api');

      // caching data from api here
      cacheData('news', `${search || 'bitcoin'}`, response);

      // sending response
      return res.status(OK).json(response);
    } catch (error) {
      logger.error(error);
      serverErrorResponse(res);
    }
  }
}
