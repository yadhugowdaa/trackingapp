import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model, Types } from 'mongoose';
import { Metric, MetricDocument } from './schemas/metric.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Metric.name) private metricModel: Model<MetricDocument>,
        private readonly httpService: HttpService,
    ) { }

    // Fetch tasks from Task Service
    private async fetchTasks(userId: string) {
        try {
            const taskServiceUrl = process.env.TASK_SERVICE_URL || 'http://localhost:3002';
            const response = await firstValueFrom(
                this.httpService.get(`${taskServiceUrl}/tasks`, {
                    headers: { 'user-id': userId },
                }),
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
            return [];
        }
    }

    async getMetrics(userId: string, period: string = 'week') {
        const tasks = await this.fetchTasks(userId);

        const now = new Date();
        const periodStart = period === 'week'
            ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Filter tasks for the period
        const periodTasks = tasks.filter(task =>
            new Date(task.createdAt) >= periodStart
        );

        const completedTasks = periodTasks.filter(t => t.status === 'completed');
        const completedOnTime = completedTasks.filter(t =>
            new Date(t.completedAt) <= new Date(t.deadline)
        );

        // Calculate metrics
        const totalTasks = periodTasks.length;
        const completed = completedTasks.length;
        const completionRate = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;
        const onTimeRate = completed > 0 ? (completedOnTime.length / completed) * 100 : 0;

        // Focus time (sum of actualTime)
        const focusTime = completedTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);

        // Efficiency (estimated vs actual)
        const tasksWithEstimates = completedTasks.filter(t => t.estimatedTime > 0 && t.actualTime > 0);
        const efficiency = tasksWithEstimates.length > 0
            ? tasksWithEstimates.reduce((sum, task) =>
                sum + ((task.estimatedTime / task.actualTime) * 100), 0) / tasksWithEstimates.length
            : 100;

        // Streak calculation (consecutive days with completed tasks)
        const streak = await this.calculateStreak(userId, tasks);

        // Procrastination index (average delay in days)
        const procrastination = completedTasks.length > 0
            ? completedTasks.reduce((sum, task) => {
                const delay = (new Date(task.completedAt).getTime() - new Date(task.deadline).getTime())
                    / (1000 * 60 * 60 * 24);
                return sum + Math.max(delay, 0);
            }, 0) / completedTasks.length
            : 0;

        return {
            period,
            totalTasks,
            completedTasks: completed,
            completionRate: Math.round(completionRate),
            onTimeRate: Math.round(onTimeRate),
            focusHours: Math.round(focusTime / 60 * 10) / 10,
            efficiency: Math.round(efficiency),
            streakDays: streak,
            procrastinationIndex: Math.round(procrastination * 10) / 10,
            productivity: this.calculateProductivityScore(completionRate, onTimeRate, efficiency),
        };
    }

    private async calculateStreak(userId: string, tasks: any[]) {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);

        if (completedTasks.length === 0) return 0;

        // Group by date
        const dateMap = new Map();
        completedTasks.forEach(task => {
            const date = new Date(task.completedAt).toDateString();
            dateMap.set(date, true);
        });

        // Count consecutive days from today backwards
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            if (dateMap.has(checkDate.toDateString())) {
                streak++;
            } else if (i > 0) {
                break; // Streak broken
            }
        }

        return streak;
    }

    private calculateProductivityScore(completion: number, onTime: number, efficiency: number) {
        // Weighted average: 40% completion, 30% on-time, 30% efficiency
        return Math.round((completion * 0.4 + onTime * 0.3 + efficiency * 0.3));
    }

    // Chart data generators
    async getCompletionTrendChart(userId: string, days: number = 7) {
        const tasks = await this.fetchTasks(userId);
        const dataPoints = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayTasks = tasks.filter(t => {
                const createdAt = new Date(t.createdAt);
                return createdAt >= date && createdAt < nextDate;
            });

            const completed = dayTasks.filter(t => t.status === 'completed').length;

            dataPoints.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                completed,
                total: dayTasks.length,
            });
        }

        return dataPoints;
    }

    async getPriorityDistributionChart(userId: string) {
        const tasks = await this.fetchTasks(userId);

        const high = tasks.filter(t => t.priority === 'high').length;
        const medium = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;

        return [
            { priority: 'High', count: high, color: '#FF3B30' },
            { priority: 'Medium', count: medium, color: '#FF9500' },
            { priority: 'Low', count: low, color: '#34C759' },
        ];
    }

    async getTimeDistributionChart(userId: string) {
        const tasks = await this.fetchTasks(userId);
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.actualTime > 0);

        // Group by tags (if available) or priority
        const distribution = completedTasks.reduce((acc, task) => {
            const category = task.priority;
            acc[category] = (acc[category] || 0) + task.actualTime;
            return acc;
        }, {});

        return Object.entries(distribution).map(([category, time]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            minutes: time,
            hours: Math.round((time as number) / 60 * 10) / 10,
        }));
    }
}
