import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNoteDto } from './dto/create-note.dto';
import {UpdateNoteDto} from './dto/update-note.dto';
import { Note } from './schemas/note.schema';
import { validate } from 'class-validator';
import { Course } from '../course/schemas/course.schema';
import { Module } from '../course/schemas/module.schema';


@Injectable()
export class NoteService {
  constructor(@InjectModel(Note.name) private readonly noteModel: Model<Note>,
            @InjectModel(Course.name) private readonly courseModel :Model<Course>,
            @InjectModel(Module.name) private moduleModel: Model< Module>,) {}
                  
  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const { creator, course, module, lesson, content } = createNoteDto;
  
    const newNote = new this.noteModel({
      creator,
      course,
      module,
      lesson,
      content,
    });
  
    console.log("New note object before save:", newNote);
  
    // Validate the new note object
    const errors = await validate(newNote);
    if (errors.length > 0) {
      console.error("Validation errors:", errors);
      throw new HttpException(
        { message: 'Input data validation failed', validationErrors: errors },
        HttpStatus.BAD_REQUEST,
      );
    }

  
    // Save the new note
    try {
      const savedNote = await newNote.save();
      console.log("Note saved successfully:", savedNote);

      return savedNote;
    } catch (error: any) {
      console.error("Error saving note to database:", error.message || error);
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

  async getAllNotes(creator: string): Promise<Note[]> {
    try {
      console.log("Received creator ID:", creator);
  
      // Validate creator ID
      if (!Types.ObjectId.isValid(creator)) {
        console.error(`Invalid Creator ID: ${creator}`);
        throw new HttpException(
          { message: `Invalid Creator ID: ${creator}` },
          HttpStatus.BAD_REQUEST,
        );
      }
  
      // Query notes by creator
      console.log("Querying database for notes with creator ID:", creator);
      const notes = await this.noteModel.find({ creator:(creator) }).exec();
  
      console.log("Fetched Notes:", notes);
  
      if (notes.length === 0) {
        console.log(`No notes found for creator ID: ${creator}`);
        return [];
      }
  
      return notes;
    } catch (error) {
      console.error("Error fetching notes for creator:", error);
      throw error; // Re-throw the original error
    }
  }
  

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
  

  async getNoteById(noteId: string): Promise<Note> {
    console.log("Fetching note with ID:", noteId);
  
    if (!Types.ObjectId.isValid(noteId)) {
      console.error("Invalid Note ID:", noteId);
      throw new HttpException('Invalid Note ID', HttpStatus.BAD_REQUEST);
    }
  
    try {
      const note = await this.noteModel.findById(noteId).exec();
      if (!note) {
        throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
      }
      return note;
    } catch (error) {
      console.error("Error fetching note with ID:", noteId, error);
      throw new HttpException(
        { message: 'Failed to fetch note' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
    

  //get your notes by course
  async getNotesbyCourse(userId: string, courseId: string): Promise<Note[]> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new HttpException(
          { message: 'Invalid User ID' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (!Types.ObjectId.isValid(courseId)) {
        throw new HttpException(
          { message: 'Invalid Course ID' },
          HttpStatus.NOT_FOUND,
        );
      }
      const notes = await this.noteModel.find({
        $and: [
          {'creator': userId},
          {'course': courseId}
        ]
      });
      return notes;
    } catch (error: any) {
      throw new HttpException(
        { message: 'Failed to fetch notes' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    
    }
  }

  //get your notes by module
  async getNotesbyModule(userId: string, moduleId: string): Promise<Note[]> {
    try {
        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(moduleId)) {
            throw new HttpException('Invalid User or Module ID', HttpStatus.BAD_REQUEST);
        }

        const module = await this.moduleModel.findById(moduleId);
        const notes_ = module?.notes;
        if(notes_?.length===0){
          return [];
        }

        const notes = await this.noteModel.find({
            creator: userId,
            module: moduleId,
        });

        if (!notes.length) {
            throw new HttpException('No notes found for this module', HttpStatus.NOT_FOUND);
        }

        return notes;
    } catch (error: any) {
        throw new HttpException(
            { message: 'Failed to fetch notes', error: error.message },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}

  
 

  }



