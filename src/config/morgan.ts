import morgan from 'morgan';
import logger from './logger';

const successResponseFormat = ':remote-addr - :method :url :status - :response-time ms';
const errorResponseFormat = ':remote-addr - :method :url :status - :response-time ms';

export const morganSuccessHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) }
});

export const morganErrorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) }
});
