import { Controller, Post, Param, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Enroll a user in a course
  @Post(':userId/enroll/:courseId')
  @HttpCode(200)
  async enrollUser(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<any> {
    return await this.userService.enrollUser(userId, courseId);
  }
}
