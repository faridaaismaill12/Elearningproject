import { Controller, Post, Param, HttpCode, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Enroll a user in a course
  @Post(':id/enroll/:courseId')
  @HttpCode(200)
  async enrollUser(
    @Param('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<any> {
    if (!userId || !courseId) {
      throw new BadRequestException('User ID and Course ID are required.');
    }
    return await this.userService.enrollUser(userId, courseId);
  }
}
