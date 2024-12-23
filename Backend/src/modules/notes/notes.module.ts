import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesController } from './notes.controller';
import { NoteService } from './notes.service';
import { NoteSchema } from './schemas/note.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    forwardRef(() => CourseModule), // Break circular dependency
    MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule, 
  ],
  controllers: [NotesController],
  providers: [NoteService],
  exports: [NoteService], // Ensure NoteService is exported
})
export class NoteModule {}
