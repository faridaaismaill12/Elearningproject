 import { Module } from '@nestjs/common';
 import { StudentDashboardService } from './student-dashboard.service';
import { StudentDashboardController  } from './student-dashboard.controller';
import {InstructorDashboardController} from './instructor-dashboard.controller';
import { InstructorDashboardService } from './instructor-dashboard.service';

@Module({
  controllers: [StudentDashboardController, InstructorDashboardController],
  providers: [StudentDashboardService, InstructorDashboardService],
})
export class DashboardModule {}
