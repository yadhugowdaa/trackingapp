import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Headers('user-id') userId: string, @Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(userId, createTaskDto);
    }

    @Get()
    findAll(@Headers('user-id') userId: string, @Query() filters: any) {
        return this.tasksService.findAll(userId, filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Headers('user-id') userId: string) {
        return this.tasksService.findOne(id, userId);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Headers('user-id') userId: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.update(id, userId, updateTaskDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Headers('user-id') userId: string) {
        return this.tasksService.remove(id, userId);
    }

    @Post(':id/complete')
    complete(@Param('id') id: string, @Headers('user-id') userId: string) {
        return this.tasksService.complete(id, userId);
    }

    @Post(':id/timer/start')
    startTimer(@Param('id') id: string, @Headers('user-id') userId: string) {
        return this.tasksService.startTimer(id, userId);
    }

    @Post(':id/timer/stop')
    stopTimer(
        @Param('id') id: string,
        @Headers('user-id') userId: string,
        @Body('timeSpent') timeSpent: number,
    ) {
        return this.tasksService.stopTimer(id, userId, timeSpent);
    }

    @Post(':id/microtasks/:microTaskId/toggle')
    toggleMicroTask(
        @Param('id') id: string,
        @Param('microTaskId') microTaskId: string,
        @Headers('user-id') userId: string,
    ) {
        return this.tasksService.toggleMicroTask(id, userId, microTaskId);
    }
}
