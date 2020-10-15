import express from 'express';
import genresRouter from './controllers/genre';
import songsRouter from './controllers/song';

export const app = express();

app.use('/songs', songsRouter);
app.use('/genres', genresRouter);
