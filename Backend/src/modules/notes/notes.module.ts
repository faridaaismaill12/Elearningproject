import { NotesController } from "./notes.controller";
import { NoteService } from "./notes.service";
import { NoteSchema } from "./schemas/note.schema";
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }])],
    controllers: [NotesController],
    providers: [NoteService],
    exports: [], // Add any exports if needed
  })
  export class NoteModule {}