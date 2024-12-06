import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Chat } from '../../chat/entities/chat.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['student', 'instructor'],
    default: 'student'
  })
  role: 'student' | 'instructor';

  @OneToMany(() => Chat, chat => chat.user)
  chats: Chat[];
}