import fs from 'fs';
import { createConnection, getRepository } from 'typeorm';
import { Song } from '../entities/song';
import { SongContent } from '../entities/songContent';

const loadSong = (songName: string): string => {
  return fs.readFileSync(`./data/songs/${songName}.json`, 'utf8');
};

const saveSong = async (name: string, filename: string, type: string) => {
  const songJson = loadSong(filename);
  await createConnection();

  const songRepository = getRepository(Song);
  const song = new Song();
  song.type = type;
  song.name = name;
  await songRepository.save(song);

  const contentRepository = getRepository(SongContent);
  const content = new SongContent();
  content.content = songJson;
  content.song = song;
  await contentRepository.save(content);
};

saveSong('Dance of The Sugar Plum Fairy', 'danceOfTheSugarPlumFairy', 'duet');
