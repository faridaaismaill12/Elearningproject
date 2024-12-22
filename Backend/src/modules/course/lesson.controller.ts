import { Body, Controller, Get, NotFoundException, Param, Post, Put } from "@nestjs/common";
import { LessonService } from "./lesson.service";
import { Lesson } from "./schemas/lesson.schema";
import { CreateLessonDto } from "./dto/create-lesson.dto";

@Controller('lessons')
export class LessonController {
    constructor(private lessonService: LessonService) { }

    //get all lesoons
    @Get()
    async getAllLessons(): Promise<Lesson[]> {
        return await this.lessonService.findAllLessons();
    }

    //get lesson by id
    @Get(':id')
    async getLessonById(@Param('id') lessonId: string) {
        const lesson= this.lessonService.findLessonById(lessonId);
        if(!lesson){
            throw new NotFoundException('lesson not found');
        }
        return lesson;
    }
    @Put(':id')
    async markLessonAsFinished(@Param('id') lessonId: string, @Body('userId') userId: string) {
        return this.lessonService.markLessonAsCompleted(lessonId, userId);
    }

    @Get(':id/completed/:userId')
    async isLessonCompletedByStudent(@Param('id') lessonId: string, @Param('userId') userId: string): Promise<{ completed: boolean }> {
        return this.lessonService.isLessonCompletedByStudent(lessonId, userId);
    }
    
   


}