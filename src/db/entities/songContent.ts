import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Song } from './song';

@Entity()
export class SongContent {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('json')
  content?: string;

  @OneToOne(() => Song, (song) => song.content, { onDelete: 'CASCADE' })
  @JoinColumn()
  song?: Song;

  @Column()
  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt?: Date;
}
