import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  appPackageName: string; // e.g., com.instagram.android

  @Prop({ required: true })
  appName: string; // e.g., Instagram

  @Prop()
  appIcon: string; // base64 icon or URL

  @Prop({ default: true })
  isLocked: boolean;

  @Prop({ default: 30 })
  dailyLimit: number; // in minutes

  @Prop({ default: 0 })
  usageToday: number; // in minutes

  @Prop({ required: true })
  lastResetDate: Date; // for daily reset

  @Prop({ default: false })
  retrieved: boolean; // if user retrieved reward without completing task
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
