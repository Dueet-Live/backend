import { Router } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';
import { Genre } from '../../db/entities/genre';
import { validateHttpRequest } from '../utils/validateHttpRequest';

const genresRouter = Router();

genresRouter.get('/', async (req, res) => {
  const repo = getRepository(Genre);
  const genres = await repo.find();
  return res.status(200).json(genres);
});

const getSongsByGenreRequestSchema = yup.string().required();
genresRouter.get('/:name', async (req, res) => {
  const genreName = validateHttpRequest(
    getSongsByGenreRequestSchema,
    req.params.name,
    res,
  );
  if (genreName === null) {
    return;
  }

  const repo = getRepository(Genre);
  const genre = await repo.findOne({
    where: { name: genreName },
    relations: ['songs'],
  });
  if (!genre) {
    return res.status(404).json({ error: 'not found' });
  }
  return res.status(200).json(genre);
});

export default genresRouter;
