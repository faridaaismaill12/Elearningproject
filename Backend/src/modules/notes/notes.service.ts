import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNoteDto } from './dto/create-note.dto';
import {UpdateNoteDto} from './dto/update-note.dto';
import { Note } from './schemas/note.schema';
import { validate } from 'class-validator';

@Injectable()
export class NoteService {
  constructor(@InjectModel(Note.name) private readonly noteModel: Model<Note>) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const { creator, course, module, lesson, content } = createNoteDto;

    const newNote = new this.noteModel({
      creator,
      course,
      module,
      lesson,
      content,
    });

    // Validate the new note object
    const errors = await validate(newNote);
    if (errors.length > 0) {
      const validationErrors = { note: 'User input is not valid.' };
      throw new HttpException(
        { message: 'Input data validation failed', validationErrors },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Save the new note
    try {
      const savedNote = await newNote.save();
      return savedNote;
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to save the note', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNotes(): Promise<Note[]>{
    const notes = await this.noteModel.find().exec();
    return notes;
  }


  // See all your notes
  async getAllNotes(creator: string): Promise<Note[]> {
    try {
      if (!Types.ObjectId.isValid(creator)) {
        throw new HttpException(
          { message: 'Invalid ID' },
          HttpStatus.NOT_FOUND,
        );
      }
      const notes = await this.noteModel.find({ "creator": new Types.ObjectId(creator) }).exec();
      return notes;
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to fetch notes' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    
    }
  }



  // Update a Note
  
  async updateNote(noteId: string, updateData: UpdateNoteDto): Promise<Note> {
    try {
      // Update the note and handle the possibility of null
      const updatedNote = await this.noteModel
        .findByIdAndUpdate(noteId, updateData, { new: true, runValidators: true })
        .exec();
  
      if (!updatedNote) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }
  
      return updatedNote as Note; // Explicitly assert the type to Note
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to update the note', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

  // Delete a Note
  async deleteNote(noteId: string): Promise<{ message: string }> {
    try {
      const deletedNote = await this.noteModel.findByIdAndDelete(noteId).exec();

      if (!deletedNote) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }

      return { message: 'Note successfully deleted' };
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to delete the note', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  

 

}
