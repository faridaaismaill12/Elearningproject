import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { LessonSchema } from './schemas/lesson.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDef } from './schemas/module.schema';
import { ModuleService } from './module.service';
import { LessonService } from './lesson.service';
import { ModuleController } from './module.controller';
import { LessonController } from './lesson.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
