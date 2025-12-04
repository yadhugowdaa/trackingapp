import { Controller, Get, Query, Headers } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('metrics')
    getMetrics(
        @Headers('user-id') userId: string,
        @Query('period') period: string = 'week',
    ) {
        return this.analyticsService.getMetrics(userId, period);
    }

    @Get('charts/completion-trend')
    getCompletionTrend(
        @Headers('user-id') userId: string,
        @Query('days') days: string = '7',
    ) {
        return this.analyticsService.getCompletionTrendChart(userId, parseInt(days));
    }

    @Get('charts/priority-distribution')
    getPriorityDistribution(@Headers('user-id') userId: string) {
        return this.analyticsService.getPriorityDistributionChart(userId);
    }

    @Get('charts/time-distribution')
    getTimeDistribution(@Headers('user-id') userId: string) {
        return this.analyticsService.getTimeDistributionChart(userId);
    }
}
