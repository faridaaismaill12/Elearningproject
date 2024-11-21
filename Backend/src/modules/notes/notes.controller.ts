import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto} from './dto/create-note.dto';
import { UpdateNoteDto} from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}
  //Create a note

  //See all your notes

  //See Your Notes based on Module or subject

  //Update a Note

  //Delete a note 
 
}
