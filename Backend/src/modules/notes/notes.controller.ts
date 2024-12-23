import { Controller, Get, Post, Patch, Delete, Param, Query, Body,  HttpException, HttpStatus} from '@nestjs/common';
import { NoteService } from './notes.service';
import { CreateNoteDto} from './dto/create-note.dto';
import { UpdateNoteDto} from './dto/update-note.dto';
import { Note } from './schemas/note.schema';
import { JwtAuthGuard} from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard';
import { Roles } from '../../decorators/roles.decorators';
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

  @Get()
  async getNotes(): Promise<Note[]>{
    try{
      return await this.notesService.getNotes();
    }catch(error: any){
      throw new HttpException(
        { message: 'Failed to fetch notes', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

   // See all your notes
  @Get(':userId')
  async getAllNotes(@Param('userId') userId: string,): Promise<Note[]> {
    try {
      return await this.notesService.getAllNotes(userId);
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to fetch notes', error: error.message },
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

// Get your notes by course
@Get(':userId/:courseId')
  async getNotesByCourse(@Param('userId') @Param('courseId') userId: string, courseId: string): Promise<Note[]> {
    try {
      return await this.notesService.getNotesbyCourse(userId,courseId);
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to fetch notes', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

// Get your notes by Module
@Get(':userId/:moduleId')
  async getNotesByModule(@Param('userId') @Param('moduleId') userId: string, moduleId: string): Promise<Note[]> {
    try {
      return await this.notesService.getNotesbyModule(userId,moduleId);
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to fetch notes', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }



                                                                                                                    
}

