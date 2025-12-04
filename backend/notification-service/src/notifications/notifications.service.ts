import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
    private fcmTokens: Map<string, string> = new Map(); // userId -> FCM token

    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        private readonly httpService: HttpService,
    ) { }

    // Harsh motivational messages (always active)
    private harshMessages = [
        "You can't do anything, you're useless",
        "You can't focus on anything",
        "You can't complete a task, how will you take care of your family?",
        "Pathetic. Your tasks are piling up and you're doing nothing",
        "Another day wasted. When will you actually accomplish something?",
        "You're falling behind everyone else. Again.",
        "Zero progress today. Sounds about right for you",
        "Your procrastination is embarrassing",
        "Still scrolling? That's why you never finish anything",
        "You're letting everyone down, including yourself",
    ];

    async saveFcmToken(userId: string, token: string) {
        this.fcmTokens.set(userId, token);
        return { message: 'FCM token saved' };
    }

    async scheduleDeadlineNotification(userId: string, taskId: string, deadline: Date, taskTitle: string) {
        // Schedule notification 3 hours before deadline
        const notificationTime = new Date(deadline.getTime() - 3 * 60 * 60 * 1000);

        const notification = new this.notificationModel({
            userId: new Types.ObjectId(userId),
            taskId: new Types.ObjectId(taskId),
            type: 'deadline',
            message: `⏰ Deadline Alert: "${taskTitle}" is due in 3 hours!`,
            scheduledFor: notificationTime,
        });

        await notification.save();
        return notification;
    }

    async sendHarshNotification(userId: string, reason: string) {
        const randomMessage = this.harshMessages[Math.floor(Math.random() * this.harshMessages.length)];

        const notification = new this.notificationModel({
            userId: new Types.ObjectId(userId),
            type: 'harsh_motivational',
            message: `💀 ${randomMessage}`,
            scheduledFor: new Date(),
        });

        await notification.save();
        await this.sendPushNotification(userId, notification.message);

        return notification;
    }

    // Check performance every day at 8 PM
    @Cron('0 20 * * *')
    async checkPerformanceAndNotify() {
        console.log('Checking user performance...');

        // This would fetch all users and check their metrics
        // For now, this is a placeholder for the cron job
        // In production, you'd loop through users and call analytics service
    }

    async triggerHarshNotificationBasedOnMetrics(userId: string) {
        try {
            const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004';
            const response = await firstValueFrom(
                this.httpService.get(`${analyticsUrl}/analytics/metrics?period=week`, {
                    headers: { 'user-id': userId },
                }),
            );

            const metrics = response.data;

            // Trigger harsh notifications based on poor performance
            if (metrics.completionRate < 30) {
                await this.sendHarshNotification(userId, 'low_completion');
            }

            if (metrics.procrastinationIndex > 5) {
                await this.sendHarshNotification(userId, 'high_procrastination');
            }

            if (metrics.streakDays === 0 && metrics.totalTasks > 5) {
                await this.sendHarshNotification(userId, 'broken_streak');
            }

            if (metrics.efficiency < 50) {
                await this.sendHarshNotification(userId, 'poor_efficiency');
            }

            return { checked: true, metrics };
        } catch (error) {
            console.error('Error checking performance:', error.message);
            return { checked: false, error: error.message };
        }
    }

    private async sendPushNotification(userId: string, message: string) {
        const fcmToken = this.fcmTokens.get(userId);

        if (!fcmToken) {
            console.log('No FCM token for user:', userId);
            return;
        }

        // In production, this would use Firebase Admin SDK
        // For now, just log the notification
        console.log(`📱 Sending notification to ${userId}:`, message);

        // Example FCM payload (would be sent to Firebase in production)
        const payload = {
            to: fcmToken,
            notification: {
                title: 'IKYKIK',
                body: message,
                sound: 'default',
            },
            data: {
                type: 'harsh_motivational',
            },
        };

        // TODO: Implement actual FCM sending with Firebase Admin SDK
        // await admin.messaging().send(payload);
    }

    async getNotifications(userId: string, limit: number = 20) {
        return this.notificationModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.notificationModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId),
        });

        if (notification) {
            notification.sent = true;
            notification.sentAt = new Date();
            await notification.save();
        }

        return notification;
    }
}
