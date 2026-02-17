import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskSchema } from './task.schema';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
    LogsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}