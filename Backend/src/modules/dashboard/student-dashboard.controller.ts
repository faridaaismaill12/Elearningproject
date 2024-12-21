import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentDashboardService } from './student-dashboard.service';
import { Roles } from '../../decorators/roles.decorator';

@Controller('dashboard/student')
export class StudentDashboardController {
  constructor(private readonly studentdashboardService: StudentDashboardService) {}
  //Get Course Progress
  //Number of Lessons Completed Today
  //Average Score Per Course
  //Best Module Score
  //Worst Module Score
    
}
