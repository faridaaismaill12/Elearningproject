import { Body, Controller, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { LessonService } from "./lesson.service";
import { Lesson } from "./schemas/lesson.schema";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { JwtAuthGuard } from "../security/guards/jwt-auth.guard";

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
    @Put(':id/complete')
@UseGuards(JwtAuthGuard) // Ensure the request is authenticated with a valid JWT token
async markLessonAsFinished(@Param('id') lessonId: string, @Req() req: any) {
    const userId = req.user.id; // Get the userId from the JWT token

    // Call the service method to mark the lesson as completed
    return this.lessonService.markLessonAsCompleted(lessonId, userId);
}
    

}