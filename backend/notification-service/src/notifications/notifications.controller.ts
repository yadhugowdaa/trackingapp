import { Controller, Get, Post, Body, Param, Headers, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('fcm-token')
    saveFcmToken(
        @Headers('user-id') userId: string,
        @Body('token') token: string,
    ) {
        return this.notificationsService.saveFcmToken(userId, token);
    }

    @Post('schedule-deadline')
    scheduleDeadline(
        @Headers('user-id') userId: string,
        @Body() body: { taskId: string; deadline: string; taskTitle: string },
    ) {
        return this.notificationsService.scheduleDeadlineNotification(
            userId,
            body.taskId,
            new Date(body.deadline),
            body.taskTitle,
        );
    }

    @Post('harsh')
    sendHarsh(
        @Headers('user-id') userId: string,
        @Body('reason') reason: string,
    ) {
        return this.notificationsService.sendHarshNotification(userId, reason);
    }

    @Post('check-performance')
    checkPerformance(@Headers('user-id') userId: string) {
        return this.notificationsService.triggerHarshNotificationBasedOnMetrics(userId);
    }

    @Get()
    getNotifications(
        @Headers('user-id') userId: string,
        @Query('limit') limit: string = '20',
    ) {
        return this.notificationsService.getNotifications(userId, parseInt(limit));
    }

    @Post(':id/read')
    markAsRead(
        @Param('id') id: string,
        @Headers('user-id') userId: string,
    ) {
        return this.notificationsService.markAsRead(id, userId);
    }
}
