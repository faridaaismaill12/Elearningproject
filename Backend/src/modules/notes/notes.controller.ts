import { Controller, Get, Post, Patch, Delete, Param, Query, Body,  HttpException, HttpStatus} from '@nestjs/common';
import { NoteService } from './notes.service';
import { CreateNoteDto} from './dto/create-note.dto';
import { UpdateNoteDto} from './dto/update-note.dto';
import { Note } from './schemas/note.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NoteService) {}
   // Create a new note
   @Post()
   async createNote(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
     try {
       return await this.notesService.create(createNoteDto);
     } catch (error: any) {
       throw new HttpException(
         { message: 'Failed to create note', error: error.message },
         HttpStatus.BAD_REQUEST,
       );
     }
   }
 
   // See all your notes
   @Get()
   async getAllNotes(@Query('userId') userId: string): Promise<Note[]> {
     try {
       return await this.notesService.getAllNotes(userId);
     } catch (error: any) {
       throw new HttpException(
         { message: 'Failed to fetch notes', error: error.message },
         HttpStatus.BAD_REQUEST,
       );
     }
   }
 
   // See your notes based on Module
   @Get('module/:moduleId')
   async getNotesByModule(
     @Query('userId') userId: string,
     @Param('moduleId') moduleId: string,
   ): Promise<Note[]> {
     try {
       return await this.notesService.getNotesByModule(userId, moduleId);
     } catch (error: any) {
       throw new HttpException(
         { message: 'Failed to fetch notes by module', error: error.message },
         HttpStatus.BAD_REQUEST,
       );
     }
   }
 
   // See your notes based on Subject
   @Get('subject/:subjectId')
   async getNotesBySubject(
     @Query('userId') userId: string,
     @Param('subjectId') subjectId: string,
   ): Promise<Note[]> {
     try {
       return await this.notesService.getNotesBySubject(userId, subjectId);
     } catch (error: any) {
       throw new HttpException(
         { message: 'Failed to fetch notes by subject', error: error.message },
         HttpStatus.BAD_REQUEST,
       );
     }
   }
 
   // Update a note
   @Patch(':noteId')
   async updateNote(
     @Param('noteId') noteId: string,
     @Body() updateNoteDto: UpdateNoteDto,
   ): Promise<Note> {
     try {
       return await this.notesService.updateNote(noteId, updateNoteDto);
     } catch (error : any) {
       throw new HttpException(
         { message: 'Failed to update note', error: error.message },
         HttpStatus.BAD_REQUEST,
       );
     }
   }
 
   // Delete a note
   @Delete(':noteId')
   async deleteNote(@Param('noteId') noteId: string): Promise<{ message: string }> {
     try {
       return await this.notesService.deleteNote(noteId);
     } catch (error: any) {
       throw new HttpException(
         { message: 'Failed to delete note', error: error.message },
         HttpStatus.BAD_REQUEST,
       );
     }
   }
 }
 
