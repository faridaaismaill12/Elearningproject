import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { Module } from "./schemas/module.schema";

@Injectable()
export class ModuleService {
    constructor(
        @InjectModel('Module') private moduleModel: Model<Module>
    ) { }

    // Get all modules
    async findAllModules(): Promise<Module[]> {
        let modules= await this.moduleModel.find().exec();
        return modules
    }

    //get module by id
    async findModuleById(moduleId: string): Promise<Module> {
        const module= await this.moduleModel.findOne({_id: moduleId }); 
        if(!module){
            throw new NotFoundException('module not found');
        }
        return module;
    }
}