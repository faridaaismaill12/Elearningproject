import { NotesController } from "./notes.controller";
import { NoteSchema } from "./schemas/note.schema";
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }])],
    controllers: [NotesController],
    providers: [],
    exports: [], // Add any exports if needed
  })
  export class NoteModule {}