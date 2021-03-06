import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import morgan from 'morgan';
import { Logger } from 'winston';
import genresRouter from './controllers/genre';
import songsRouter from './controllers/song';

export const createResourceServer = (logger: Logger): core.Express => {
  const app = express();

  const stream = {
    write: (message: string) => logger.info(message),
  };

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined', { stream }));
  } else {
    app.use(morgan('dev', { stream }));
  }

  app.use(cors());
  app.use('/songs', songsRouter);
  app.use('/genres', genresRouter);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Uncaught error', { error: err });
    res.sendStatus(500);
  });

  return app;
};
