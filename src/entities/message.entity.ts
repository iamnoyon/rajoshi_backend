import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sender_id: string;

  @Column()
  receiver_id: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
