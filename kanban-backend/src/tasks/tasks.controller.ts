import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body('title') title: string) {
    return this.tasksService.create(title);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateData: { status?: string, targetId?: string }
  ) {
    return this.tasksService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}