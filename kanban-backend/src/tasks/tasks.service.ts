import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './task.schema';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel('Task') private taskModel: Model<Task>,
    private logsService: LogsService,
  ) {}

  async findAll() {
    return this.taskModel.find().sort({ position: 1 }).exec();
  }

  async create(title: string) {
    const count = await this.taskModel.countDocuments();
    const task = new this.taskModel({ title, status: 'todo', position: count });
    await this.logsService.create('CREATED', `Task "${title}" created.`);
    return task.save();
  }

  async update(id: string, updateData: { status?: string, targetId?: string }) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');

    const oldStatus = task.status;
    const newStatus = updateData.status || oldStatus;
    const oldPos = task.position;

    if (updateData.targetId) {
      const targetTask = await this.taskModel.findById(updateData.targetId);
      if (targetTask) {
        const newPos = targetTask.position;

        if (oldPos < newPos) {
          // MOVING DOWN: Shift tasks between old and new positions UP (-1)
          await this.taskModel.updateMany(
            { position: { $gt: oldPos, $lte: newPos } },
            { $inc: { position: -1 } }
          );
        } else if (oldPos > newPos) {
          // MOVING UP: Shift tasks between new and old positions DOWN (+1)
          await this.taskModel.updateMany(
            { position: { $gte: newPos, $lt: oldPos } },
            { $inc: { position: 1 } }
          );
        }
        task.position = newPos;
      }
    } else if (updateData.status && updateData.status !== oldStatus) {
      // If just changing columns, append to the end of the new column
      const count = await this.taskModel.countDocuments({ status: updateData.status });
      task.position = count;
    }

    task.status = newStatus;
    await task.save();

    if (oldStatus !== newStatus) {
      await this.logsService.create('MOVED', `Moved "${task.title}" to ${newStatus}.`);
    }

    return task;
  }

  async remove(id: string) {
    const task = await this.taskModel.findByIdAndDelete(id);
    if (!task) throw new NotFoundException('Task not found');
    await this.logsService.create('DELETED', `Deleted task "${task.title}".`);
    return task;
  }
}