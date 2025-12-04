import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
    constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) { }

    async create(userId: string, createTaskDto: CreateTaskDto) {
        const task = new this.taskModel({
            ...createTaskDto,
            userId: new Types.ObjectId(userId),
            tags: createTaskDto.tags?.map(tag => new Types.ObjectId(tag)) || [],
        });

        await task.save();
        return task;
    }

    async findAll(userId: string, filters?: any) {
        const query: any = { userId: new Types.ObjectId(userId) };

        // Apply filters
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.priority) {
            query.priority = filters.priority;
        }
        if (filters.tag) {
            query.tags = new Types.ObjectId(filters.tag);
        }

        let tasks = await this.taskModel.find(query).sort({ deadline: 1 }).exec();

        // Smart sorting if requested
        if (filters.sort === 'smart') {
            tasks = this.smartSort(tasks);
        }

        return tasks;
    }

    async findOne(id: string, userId: string) {
        const task = await this.taskModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId),
        }).exec();

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    async update(id: string, userId: string, updateTaskDto: UpdateTaskDto) {
        const task = await this.findOne(id, userId);

        Object.assign(task, updateTaskDto);

        if (updateTaskDto.tags) {
            task.tags = updateTaskDto.tags.map(tag => new Types.ObjectId(tag));
        }

        await task.save();
        return task;
    }

    async remove(id: string, userId: string) {
        const task = await this.findOne(id, userId);
        await task.deleteOne();
        return { message: 'Task deleted successfully' };
    }

    async complete(id: string, userId: string) {
        const task = await this.findOne(id, userId);
        task.status = 'completed';
        task.completedAt = new Date();
        await task.save();
        return task;
    }

    async startTimer(id: string, userId: string) {
        const task = await this.findOne(id, userId);
        // In real implementation, you'd track timer start time
        return { message: 'Timer started', taskId: id };
    }

    async stopTimer(id: string, userId: string, timeSpent: number) {
        const task = await this.findOne(id, userId);
        task.actualTime += timeSpent;
        await task.save();
        return task;
    }

    async toggleMicroTask(id: string, userId: string, microTaskId: string) {
        const task = await this.findOne(id, userId);
        const microTask = task.microTasks.find(mt => mt._id.toString() === microTaskId);

        if (!microTask) {
            throw new NotFoundException('Micro-task not found');
        }

        microTask.completed = !microTask.completed;
        microTask.completedAt = microTask.completed ? new Date() : null;

        await task.save();
        return task;
    }

    // Smart sorting algorithm: priority + deadline urgency
    private smartSort(tasks: TaskDocument[]): TaskDocument[] {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const now = new Date().getTime();

        return tasks.sort((a, b) => {
            const deadlineA = new Date(a.deadline).getTime();
            const deadlineB = new Date(b.deadline).getTime();

            const hoursRemainingA = (deadlineA - now) / (1000 * 60 * 60);
            const hoursRemainingB = (deadlineB - now) / (1000 * 60 * 60);

            const scoreA = priorityWeight[a.priority] * 100 + (1000 / Math.max(hoursRemainingA, 1));
            const scoreB = priorityWeight[b.priority] * 100 + (1000 / Math.max(hoursRemainingB, 1));

            return scoreB - scoreA;
        });
    }
}
