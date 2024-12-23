import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { Module } from "./schemas/module.schema";
import { LessonService } from './lesson.service';
import { Lesson, LessonDocument} from './schemas/lesson.schema';

@Injectable()
export class ModuleService {
    constructor(
        @InjectModel('Module') private moduleModel: Model<Module>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        private readonly lessonService: LessonService // 
    ) { }

    // Get all modules
    async findAllModules(): Promise<Module[]> {
        let modules= await this.moduleModel.find().exec();
        return modules
    }

    //get module by id
    async findModuleById(moduleId: string): Promise<Module> {
        const module= await this.moduleModel.findOne({ moduleId }); 
        if(!module){
            throw new NotFoundException('module not found');
        }
        return module;
    }

    

    async isModuleCompletedByStudent(moduleId: string, studentId: string): Promise<boolean> {
        const module = await this.moduleModel.findById(moduleId).populate('lessons');
        if (!module) {
            throw new NotFoundException(`Module with ID ${moduleId} not found.`);
        }
    
        const lessons = module.lessons as LessonDocument[];
        for (const lesson of lessons) {
            const { completed } = await this.lessonService.isLessonCompletedByStudent(lesson.lessonId, studentId);
            if (!completed) {
                return false;
            }
        }
        return true;
    }
    
}