import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User , UserSchema } from './schemas/user.schema';
import { Course , CourseSchema } from '../course/schemas/course.schema';
import { JwtModule } from '@nestjs/jwt'; // Optional: for JWT authentication

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name , schema: UserSchema },
      { name: Course.name , schema: CourseSchema }
    ]) ,
    JwtModule.register({})  // Optional: for JWT token setup if needed
  ] ,
  controllers: [UserController] ,
  providers: [UserService]
})
export class UserModule {}