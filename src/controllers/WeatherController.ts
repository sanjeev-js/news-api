import { Controller, Get } from '@overnightjs/core';
import { Request, response, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import { serverErrorResponse } from './errors';
import { asyncWrap } from '../utils/asyncWrap';
import axios from 'axios';
import moment from 'moment';
import getCache from '../redis/getCache';
import cacheData from '../redis/cacheData';

const { OK } = StatusCodes;

@Controller('weather')
export class WeatherController {
  @Get('')
  private async weatherData(req: Request, res: Response) {
    try {
      const API_KEY = process.env.OPENWEATHERKEY;
      const { city, country } = req.query;

      const inputStr = `${city}-${country}`;
      // getting cache data
      const cachedData = await getCache('weather', `${inputStr || 'bengaluru-in'}`);
      if (cachedData !== null) {
        // logger.info('response from cache');
        return res.status(OK).json(cachedData);
      }

      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city || 'bengaluru'},${
        country || 'in'
      }&appid=${API_KEY}&units=metric`;

      const [error, result] = await asyncWrap(axios.get(url));
      if (error) {
        logger.error(error);
        serverErrorResponse(res);
      }

      const response: any = {
        count: result.data.cnt,
        unit: 'metric',
        location: result.data.city.name,
        country: result.data.city.country
      };

      const data = result.data.list.map((item: any) => ({
        date: moment(item.dt_txt).format('LLLL'),
        main: item.weather[0].main,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        wind_speed: item.wind.speed
      }));

      response.data = data;
      // logger.info('return from api');

      // caching data from api here
      cacheData('weather', `${inputStr || 'bengaluru-in'}`, response);

      return res.status(OK).json(response);
    } catch (error) {
      logger.error(error);
      serverErrorResponse(res);
    }
  }
}
