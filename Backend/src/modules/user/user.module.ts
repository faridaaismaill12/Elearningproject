import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Course.name, schema: CourseSchema }, // Add the Course schema here
      ]),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
  })
  export class UserModule {}