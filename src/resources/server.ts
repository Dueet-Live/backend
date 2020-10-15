import express from 'express';
import { songsRouter } from './controllers/song';

export const app = express();

app.use('/songs', songsRouter);
