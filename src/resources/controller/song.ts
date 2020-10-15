import express, { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';
import { Song } from '../entity/song';
import { validateHttpRequest } from '../utils/validateHttpRequest';

export const songsRouter = express.Router();

songsRouter.get('/', async (req: Request, res: Response) => {
  const repository = getRepository(Song);
  const songs = await repository.find();
  return res.status(200).json(songs);
});

const songContentRequestSchema = yup.number().defined().min(1);
songsRouter.get('/:id/content', async (req, res) => {
  const id = validateHttpRequest(songContentRequestSchema, req.params.id, res);
  if (id === null) {
    return;
  }
  const repository = getRepository(Song);
  const song = await repository.findOne({
    where: { id: id },
    relations: ['content'],
  });

  if (!song) {
    return res.status(404).json({ error: 'not found' });
  }
  return res.status(200).json({ ...song, content: song.content?.content });
});
