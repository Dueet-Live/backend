import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @Column()
  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt?: Date;
}
