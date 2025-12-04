import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

class MicroTask {
    @Prop({ type: Types.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ default: false })
    completed: boolean;

    @Prop()
    completedAt: Date;
}

@Schema({ timestamps: true })
export class Task {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    dateTime: Date;

    @Prop({ required: true })
    deadline: Date;

    @Prop({ required: true, enum: ['high', 'medium', 'low'] })
    priority: string;

    @Prop({ required: true, enum: ['pending', 'completed'], default: 'pending' })
    status: string;

    @Prop({ default: 0 })
    estimatedTime: number; // in minutes

    @Prop({ default: 0 })
    actualTime: number; // in minutes

    @Prop({ type: Types.ObjectId, default: null })
    parentTaskId: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], default: [] })
    tags: Types.ObjectId[];

    @Prop({ type: [MicroTask], default: [] })
    microTasks: MicroTask[];

    @Prop()
    completedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
