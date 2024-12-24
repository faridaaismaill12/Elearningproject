import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { Module } from "./schemas/module.schema";
import { LessonService } from './lesson.service';
import { Lesson, LessonDocument} from './schemas/lesson.schema';
import { QuizResponse } from "../quizzes/schemas/response.schema";
import { User } from "../user/schemas/user.schema";

@Injectable()
export class ModuleService {
    constructor(
        @InjectModel('Module') private moduleModel: Model<Module>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(QuizResponse.name) private responseModel: Model<QuizResponse>,
        @InjectModel(User.name) private userModel: Model<User>,
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

    async isModuleCompletedByStudent(moduleId: string, userId: string): Promise<boolean> {
        const module = await this.moduleModel.findById(moduleId).populate('lessons quizzes');
        if (!module) {
            throw new NotFoundException(`Module with ID ${moduleId} not found.`);
        }
    
        console.log('Populated module:', module);
    
        // Check if all lessons are completed
        const lessons = module.lessons as LessonDocument[];
        for (const lesson of lessons) {
            const { completed } = await this.lessonService.isLessonCompletedByStudent(lesson.lessonId, userId);
            if (!completed) {
                return false;
            }
        }
    
        // Validate quizzes
        if (!module.quizzes || module.quizzes.length === 0) {
            throw new NotFoundException(`No quizzes found for module with ID ${moduleId}.`);
        }
    
        // Calculate average score for quizzes
        const moduleQuizzes = module.quizzes.map((quiz) => quiz._id);
        const responses = await this.responseModel.find({
            user: userId,
            quiz: { $in: moduleQuizzes },
        });
    
        if (responses.length < moduleQuizzes.length) {
            return false; // Not all quizzes are attempted
        }
    
        const totalScore = responses.reduce((sum, response) => sum + (response.score || 0), 0);
        const averageScore = totalScore / moduleQuizzes.length;

        await this.userModel.updateOne
    
        return averageScore >= 80;
    }
    
    

  
}