import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstructorDashboardService } from './instructor-dashboard.service';
import { Roles } from '../../decorators/roles.decorator';

@Controller('dashboard/instructor')
export class InstructorDashboardController {
  constructor(private readonly instructordashboardService: InstructorDashboardService) {}
//Instructor Methods
    //Number of Enrolled Students per course
    //Average Completion Rate
    //Average Quiz Grade by Course
    //Average Quiz Grade by Module 
    //Average Course Rating

}
