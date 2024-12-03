import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { LessonService } from "./lesson.service";
import { Lesson } from "./schemas/lesson.schema";

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
        return this.lessonService.findLessonById(lessonId);
  }

  @Put(':id/finish')
    async markLessonAsFinished(@Param('id') lessonId: string, @Body('userId') userId: string) {
        return this.lessonService.markLessonAsCompleted(lessonId, userId);
    }
}