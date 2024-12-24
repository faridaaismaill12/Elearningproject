import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User , UserSchema } from './schemas/user.schema';
import { Course , CourseSchema } from '../course/schemas/course.schema';
import { JwtModule } from '@nestjs/jwt'; // Optional: for JWT authentication
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({

  imports: [
    MongooseModule.forFeature([
      { name: User.name , schema: UserSchema },
      { name: Course.name , schema: CourseSchema }
    ]),
     JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController] ,
  providers: [UserService],
  exports: [UserService]

})

export class UserModule {}

