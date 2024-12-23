import { Controller, Get,Param} from '@nestjs/common';
import { InstructorDashboardService } from './instructor-dashboard.service';
import { Roles } from '../../decorators/roles.decorator';
import { NotFoundException,BadRequestException} from '@nestjs/common';

@Controller('dashboard/instructor')
export class InstructorDashboardController {
  constructor(private readonly instructordashboardService: InstructorDashboardService) {}
    
  //Number of Enrolled Students per course
    @Roles('instructor')
    @Get(':courseId/enrolled-students')
    async getEnrolledStudents(@Param('courseId') courseId: string): Promise<Number>{
      try {
        const numberEnrolledStudents = await this.instructordashboardService.numberEnrolledStudents(courseId);
        return numberEnrolledStudents;
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
          throw error;  
        }
        throw new NotFoundException('Error Finding Number of Enrolled Students');
      } 
    }

    //Average Completion Rate
    @


    //Average Quiz Grade by Course
    @Roles('instructor')
    @Get(':courseId/average-grades')  
      async getAverageCourseGrade(@Param('courseId') courseId: string): Promise<number> {
        try {
          const average = await this.instructordashboardService.averageCourseGrades(courseId);
          return average;
        } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;  
          }
          throw new NotFoundException('Error calculating average quiz score');
        }
      }
    
      //Average Quiz Grade by Module
    @Roles('instructor')
    @Get(':moduleId/average-modules')  
      async getAverageModuleGrade(@Param('moduleId') moduleId: string): Promise<number> {
        try {
          const average = await this.instructordashboardService.averageModuleGrades(moduleId);
          return average;
        } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;  
          }
          throw new NotFoundException('Error calculating average quiz score');
        }
      } 
   
      //Average Course Rating
    @Roles('instructor')
    @Get(':courseId/average-rating')  
      async getAverageRating(@Param('courseID') courseID: string): Promise<number> {
        try {
          const average = await this.instructordashboardService.averageCourseRating(courseID);
          return average;
        } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;  
          }
          throw new Error('Error calculating average Course Rating');
        }
      } 

}
