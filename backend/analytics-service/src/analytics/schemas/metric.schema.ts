import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MetricDocument = Metric & Document;

@Schema({ timestamps: true })
export class Metric {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: Date; // Daily metrics

    @Prop({ default: 0 })
    tasksCreated: number;

    @Prop({ default: 0 })
    tasksCompleted: number;

    @Prop({ default: 0 })
    tasksCompletedOnTime: number;

    @Prop({ default: 0 })
    totalFocusTime: number; // in minutes

    @Prop({ default: 0 })
    averageEfficiency: number; // percentage (actualTime / estimatedTime * 100)

    @Prop({ default: 0 })
    streakDays: number;

    @Prop({ default: 0 })
    procrastinationIndex: number; // average days delayed
}

export const MetricSchema = SchemaFactory.createForClass(Metric);
