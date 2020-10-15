import express from 'express';
import { songsRouter } from './controller/song';

export const app = express();

app.use('/songs', songsRouter);
