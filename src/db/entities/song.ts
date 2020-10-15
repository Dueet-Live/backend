import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Genre } from './genre';
import { SongContent } from './songContent';

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  type?: string;

  @Column()
  name?: string;

  @OneToOne(() => SongContent, (content) => content.song)
  content?: SongContent;

  @ManyToOne(() => Genre, (genre) => genre.songs)
  genre?: Genre;

  @Column()
  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt?: Date;
}
