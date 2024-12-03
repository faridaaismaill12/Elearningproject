import { Controller, Get, Param } from "@nestjs/common";
import { ModuleService } from "./module.service";
import { Module } from "./schemas/module.schema";

@Controller('modules')
export class ModuleController {
    constructor(private moduleService: ModuleService) { }

    //get all modules
    @Get()
    async getAllmodules(): Promise<Module[]> {
        return await this.moduleService.findAllModules();
    }

    //get module by id
    @Get(':id')
    async getModuleById(@Param('id') moduleId: string) {
        return this.moduleService.findModuleById(moduleId);
  }
}