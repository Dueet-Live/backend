import fs from 'fs';
import { createConnection, getRepository } from 'typeorm';
import { Genre } from '../entities/genre';
import { Song } from '../entities/song';
import { SongContent } from '../entities/songContent';

const loadSong = (songName: string): string => {
  return fs.readFileSync(`./data/songs/${songName}.json`, 'utf8');
};

const saveSong = async (
  name: string,
  filename: string,
  type: string,
  genre?: Genre,
) => {
  const songJson = loadSong(filename);

  const songRepository = getRepository(Song);
  const song = new Song();
  song.type = type;
  song.name = name;
  song.genre = genre;
  await songRepository.save(song);

  const contentRepository = getRepository(SongContent);
  const content = new SongContent();
  content.content = songJson;
  content.song = song;
  await contentRepository.save(content);

  console.log(`Created song ${name}, type = ${type}, genre = ${genre?.name}`);
};

const createGenre = async (name: string): Promise<Genre> => {
  const genreRepository = getRepository(Genre);
  const genre = new Genre();
  genre.name = name;
  await genreRepository.save(genre);
  console.log(`Created genre ${name}`);
  return genre;
};

(async () => {
  const connection = await createConnection();
  const classicalGenre = await createGenre('classical');
  await saveSong(
    'Dance of The Sugar Plum Fairy',
    'danceOfTheSugarPlumFairy',
    'duet',
    classicalGenre,
  );
  await connection.close();
})();
