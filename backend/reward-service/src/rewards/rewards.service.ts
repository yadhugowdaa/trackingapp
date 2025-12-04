import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { CreateRewardDto, UpdateUsageDto } from './dto/reward.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    private readonly httpService: HttpService,
  ) {}

  async addApp(userId: string, createRewardDto: CreateRewardDto) {
    // Check if app already exists
    const existingApp = await this.rewardModel.findOne({
      userId: new Types.ObjectId(userId),
      appPackageName: createRewardDto.appPackageName,
    });

    if (existingApp) {
      throw new BadRequestException('This app is already in your rewards');
    }

    const reward = new this.rewardModel({
      ...createRewardDto,
      userId: new Types.ObjectId(userId),
      lastResetDate: new Date(),
    });

    await reward.save();
    return reward;
  }

  async getApps(userId: string) {
    return this.rewardModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async getAppStatus(id: string, userId: string) {
    const reward = await this.rewardModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!reward) {
      throw new NotFoundException('Reward app not found');
    }

    // Check if we need to reset daily usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(reward.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    if (today > lastReset) {
      // Reset usage for new day
      reward.usageToday = 0;
      reward.lastResetDate = new Date();
      await reward.save();
    }

    // Check if app should be locked
    const remainingMinutes = reward.dailyLimit - reward.usageToday;
    const isLocked = remainingMinutes <= 0;

    return {
      ...reward.toObject(),
      remainingMinutes: Math.max(remainingMinutes, 0),
      canUse: !isLocked && !reward.isLocked,
    };
  }

  async checkUnlockEligibility(userId: string, appId: string) {
    try {
      // Fetch completed tasks from Task Service
      const taskServiceUrl = process.env.TASK_SERVICE_URL || 'http://localhost:3002';
      const response = await firstValueFrom(
        this.httpService.get(`${taskServiceUrl}/tasks?status=completed`, {
          headers: { 'user-id': userId },
        }),
      );

      const completedTasks = response.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count tasks completed today
      const tasksCompletedToday = completedTasks.filter(task => {
        const completedAt = new Date(task.completedAt);
        completedAt.setHours(0, 0, 0, 0);
        return completedAt.getTime() === today.getTime();
      }).length;

      const reward = await this.getAppStatus(appId, userId);

      return {
        canUnlock: tasksCompletedToday > 0,
        tasksCompletedToday,
        remainingMinutes: reward.remainingMinutes,
        message: tasksCompletedToday > 0 
          ? `You've completed ${tasksCompletedToday} task(s) today! You can use this app.`
          : "Complete at least 1 task today to unlock this app!",
      };
    } catch (error) {
      console.error('Error checking unlock eligibility:', error.message);
      return {
        canUnlock: false,
        tasksCompletedToday: 0,
        message: 'Error checking tasks',
      };
    }
  }

  async unlockApp(id: string, userId: string) {
    const eligibility = await this.checkUnlockEligibility(userId, id);

    if (!eligibility.canUnlock) {
      throw new BadRequestException(eligibility.message);
    }

    const reward = await this.rewardModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (reward.remainingMinutes <= 0) {
      throw new BadRequestException('Daily limit reached! Complete more tasks tomorrow.');
    }

    reward.isLocked = false;
    await reward.save();

    return {
      ...reward.toObject(),
      message: `${reward.appName} unlocked! You have ${reward.remainingMinutes} minutes remaining.`,
    };
  }

  async retrieveReward(id: string, userId: string) {
    const reward = await this.rewardModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!reward) {
      throw new NotFoundException('Reward app not found');
    }

    // User can retrieve reward but task remains
    reward.retrieved = true;
    reward.isLocked = false;
    await reward.save();

    return {
      ...reward.toObject(),
      message: `${reward.appName} retrieved! Remember, the task still needs completion.`,
    };
  }

  async updateUsage(id: string, userId: string, updateUsageDto: UpdateUsageDto) {
    const reward = await this.rewardModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!reward) {
      throw new NotFoundException('Reward app not found');
    }

    reward.usageToday += updateUsageDto.usageMinutes;

    // Auto-lock if limit reached
    if (reward.usageToday >= reward.dailyLimit) {
      reward.isLocked = true;
    }

    await reward.save();

    return {
      ...reward.toObject(),
      remainingMinutes: Math.max(reward.dailyLimit - reward.usageToday, 0),
    };
  }

  async removeApp(id: string, userId: string) {
    const reward = await this.rewardModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!reward) {
      throw new NotFoundException('Reward app not found');
    }

    await reward.deleteOne();
    return { message: 'App removed from rewards' };
  }

  // Reset all apps at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyUsage() {
    console.log('Resetting daily app usage...');
    
    const today = new Date();
    await this.rewardModel.updateMany(
      {},
      {
        $set: {
          usageToday: 0,
          lastResetDate: today,
          isLocked: true, // Lock all apps at start of day
          retrieved: false,
        },
      },
    );

    console.log('Daily usage reset complete');
  }
}
