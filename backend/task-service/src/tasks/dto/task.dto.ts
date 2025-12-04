import { IsNotEmpty, IsString, IsDateString, IsEnum, IsNumber, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class MicroTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string;
}

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsDateString()
    dateTime: string;

    @IsNotEmpty()
    @IsDateString()
    deadline: string;

    @IsNotEmpty()
    @IsEnum(['high', 'medium', 'low'])
    priority: string;

    @IsOptional()
    @IsNumber()
    estimatedTime: number;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    tags: string[];

    @IsOptional()
    @IsArray()
    microTasks: MicroTaskDto[];
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsDateString()
    dateTime: string;

    @IsOptional()
    @IsDateString()
    deadline: string;

    @IsOptional()
    @IsEnum(['high', 'medium', 'low'])
    priority: string;

    @IsOptional()
    @IsEnum(['pending', 'completed'])
    status: string;

    @IsOptional()
    @IsNumber()
    estimatedTime: number;

    @IsOptional()
    @IsNumber()
    actualTime: number;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    tags: string[];

    @IsOptional()
    @IsArray()
    microTasks: MicroTaskDto[];
}
