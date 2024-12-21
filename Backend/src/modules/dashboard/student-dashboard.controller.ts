import { Controller, Get, Param } from '@nestjs/common';
import { StudentDashboardService } from './student-dashboard.service';
import { Roles } from '../../decorators/roles.decorator';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Module } from '../course/schemas/module.schema';

@Controller('dashboard/student')
export class StudentDashboardController {
  constructor(private readonly studentdashboardService: StudentDashboardService) {}
  //Get Course Progress
  @Roles('student')
  @Get(':courseId/progress')
  async getProgressByCourse (@Param('courseId') courseId: string, @Param('userId') userId: string): Promise<number> {
          try {
            const progress = await this.studentdashboardService.getCourseProgress(userId, courseId);
            return progress;
          } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;  
            }
            throw new Error('Error Finding Progress');
          }
        }
  //Number of Lessons Completed Today
  
  //Average Score Per Course
  @Roles('student')
  @Get(':courseId/average-score')
  async getAverageByCourse (@Param('courseId') courseId: string, @Param('userId') userId: string): Promise<number> {
          try {
            const average = await this.studentdashboardService.averageCourseGrades(userId, courseId);
            return average;
          } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;  
            }
            throw new Error('Error Calculating Average');
          }
        }
  
  //Best Module Score
  @Roles('student')
  @Get(':courseId/best-Module')
  async findBestModule (@Param('courseId') courseId: string, @Param('userId') userId: string): Promise<Module> {
          try {
            const bestModule = await this.studentdashboardService.findBestModule(userId, courseId);
            return bestModule;
          } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;  
            }
            throw new Error('Error Finding Module');
          }
        }
  
   //Worst Module Score
  @Roles('student')
  @Get(':courseId/worst-module')
  async findWorstModule (@Param('courseId') courseId: string, @Param('userId') userId: string): Promise<Module> {
          try {
            const worstModule = await this.studentdashboardService.findWorstModule(userId, courseId);
            return worstModule;
          } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;  
            }
            throw new Error('Error Finding Module');
          }
        }
    
}
