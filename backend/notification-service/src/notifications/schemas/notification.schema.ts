import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, enum: ['deadline', 'harsh_motivational', 'reminder'] })
    type: string;

    @Prop({ required: true })
    message: string;

    @Prop({ type: Types.ObjectId })
    taskId: Types.ObjectId;

    @Prop({ default: false })
    sent: boolean;

    @Prop()
    sentAt: Date;

    @Prop({ required: true })
    scheduledFor: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
