import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { User, UserSchema } from '../user/schemas/user.schema';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { LessonSchema } from './schemas/lesson.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDef } from './schemas/module.schema';

@Module({
  imports: [
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
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: ModuleSchema.name, schema: ModuleSchemaDef },
      { name: 'Lesson', schema: LessonSchema },
      { name: User.name, schema:UserSchema}
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'uploads'), // Serve `uploads` from the project root
      serveRoot: '/uploads', // Expose the uploads folder via `/uploads`
    }),
  ],
  controllers: [CourseController, ModuleController, LessonController],
  providers: [CourseService, ModuleService, LessonService],
  exports: [CourseService, ModuleService, LessonService, MongooseModule],
})
export class CourseModule {}

