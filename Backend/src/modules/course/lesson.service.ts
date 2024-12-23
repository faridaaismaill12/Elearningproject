import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LessonDocument } from "./schemas/lesson.schema";
import { CreateLessonDto } from "./dto/create-lesson.dto";

@Injectable()
export class LessonService {
    constructor(
        @InjectModel('Lesson') private lessonModel: Model<LessonDocument>
    ) { }

    // Get all lessons
    async findAllLessons(): Promise<LessonDocument[]> {
        return await this.lessonModel.find().exec();
    }

    //get lesson by id
    async findLessonById(lessonId: string): Promise<LessonDocument> {
        const lesson= await this.lessonModel.findOne({ lessonId }).exec(); 
        if(!lesson){
            throw new NotFoundException('lesson not found');
        }
        return lesson;
    }

    async markLessonAsCompleted(lessonId: string, userId: string): Promise<{ message: string }> {
        const lesson = await this.lessonModel.findOne({ lessonId });
        
          if (!lesson) {
            throw new NotFoundException(`Lesson not found`);
          }
          const alreadyCompleted = lesson.completions.some(
            (completion) => completion?.userId?.toString() === userId
          );
        
          if (alreadyCompleted) {
            throw new Error('Lesson already marked as completed by this user');
          }
          lesson.completions.push({
            userId,
            completedAt: new Date(),
            state: 'completed'
          });
          await lesson.save();
          return { message: 'Lesson successfully marked as completed' };
        }

        
        async isLessonCompletedByStudent(lessonId: string, userId: string): Promise<{ completed: boolean }> {
          const lesson = await this.lessonModel.findOne({ lessonId }).exec();
          if (!lesson) {
              throw new NotFoundException('Lesson not found');
          } 
          const completionRecord = lesson.completions.find(
              (completion) => completion.userId === userId && completion.state === 'completed'
          );
          return { completed: !!completionRecord };
      }
}