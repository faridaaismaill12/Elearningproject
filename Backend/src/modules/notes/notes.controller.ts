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
   @Post('createNote')
   async createNote(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
     try {
       console.log("Payload received by createNote endpoint:", createNoteDto); // Log the payload
   
       // Ensure all required fields are present
       if (!createNoteDto.creator || !createNoteDto.course || !createNoteDto.content) {
         console.error("Missing required fields:", createNoteDto);
         throw new HttpException(
           { message: 'Missing required fields', fields: createNoteDto },
           HttpStatus.BAD_REQUEST
         );
       }
   
       return await this.notesService.create(createNoteDto);
     } catch (error: any) {
       console.error("Error in createNote endpoint:", error.message || error);
       throw new HttpException(
         { message: 'Failed to create note', error: error.message },
         HttpStatus.INTERNAL_SERVER_ERROR,
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
   @Get('getAllNotes') // Map to /notes/getAllNotes
   async getAllNotes(@Query('creator') creator: string) {
     try {
       if (!creator) {
         throw new HttpException(
           { message: 'Creator ID is required' },
           HttpStatus.BAD_REQUEST,
         );
       }
       return await this.notesService.getAllNotes(creator);
     } catch (error) {
       console.error("Error in getAllNotes endpoint:", error);
       throw error;
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
  @Get(':noteId')
  async getNoteById(@Param('noteId') noteId: string): Promise<Note> {
    return await this.notesService.getNoteById(noteId);
  }
  
  
                                                                                                                    
}

