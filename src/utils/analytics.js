// Analytics utility functions

export const filterByTimeRange = (tasks, timeRange) => {
    const now = new Date();
    const ranges = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        'all': null,
    };

    const days = ranges[timeRange];
    if (!days) return tasks;

    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return tasks.filter(task => new Date(task.createdAt) >= cutoff);
};

export const calculateCompletionRate = (tasks, timeRange = 'all') => {
    const filtered = filterByTimeRange(tasks, timeRange);
    if (filtered.length === 0) return 0;

    const completed = filtered.filter(t => t.status === 'completed').length;
    return Math.round((completed / filtered.length) * 100);
};

export const calculateStreak = (tasks) => {
    const completedTasks = tasks
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (completedTasks.length === 0) {
        return { current: 0, longest: 0, status: 'broken' };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a task completed today or yesterday
    const lastCompletedDate = new Date(completedTasks[0].createdAt);
    lastCompletedDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastCompletedDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0 || daysDiff === 1) {
        // Active or can be continued
        currentStreak = 1;

        for (let i = 1; i < completedTasks.length; i++) {
            const prevDate = new Date(completedTasks[i - 1].createdAt);
            const currDate = new Date(completedTasks[i].createdAt);
            prevDate.setHours(0, 0, 0, 0);
            currDate.setHours(0, 0, 0, 0);

            const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                currentStreak++;
                tempStreak++;
            } else {
                break;
            }

            longestStreak = Math.max(longestStreak, tempStreak);
        }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    const status = daysDiff === 0 ? 'active' : daysDiff === 1 ? 'at-risk' : 'broken';

    return { current: currentStreak, longest: longestStreak, status };
};

export const calculateTaskVelocity = (tasks, days = 7) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentCompleted = tasks.filter(
        t => t.status === 'completed' && new Date(t.createdAt) >= cutoff
    );

    return (recentCompleted.length / days).toFixed(1);
};

export const calculateProductivityScore = (tasks) => {
    if (tasks.length === 0) return 0;

    const completionRate = calculateCompletionRate(tasks);
    const streak = calculateStreak(tasks);
    const velocity = parseFloat(calculateTaskVelocity(tasks, 7));

    // On-time completion (tasks completed before deadline)
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const onTime = completedTasks.filter(
        t => new Date(t.createdAt) <= new Date(t.deadline)
    ).length;
    const onTimeRate = completedTasks.length > 0 ? (onTime / completedTasks.length) * 100 : 0;

    // Micro-task completion
    const tasksWithMicro = tasks.filter(t => t.microTasks && t.microTasks.length > 0);
    let microProgress = 0;
    if (tasksWithMicro.length > 0) {
        const totalMicro = tasksWithMicro.reduce((sum, t) => sum + t.microTasks.length, 0);
        const completedMicro = tasksWithMicro.reduce(
            (sum, t) => sum + t.microTasks.filter(mt => mt.completed).length,
            0
        );
        microProgress = (completedMicro / totalMicro) * 100;
    }

    // Priority task completion
    const highPriorityTasks = tasks.filter(t => t.priority === 'high');
    const highCompleted = highPriorityTasks.filter(t => t.status === 'completed').length;
    const priorityRate = highPriorityTasks.length > 0
        ? (highCompleted / highPriorityTasks.length) * 100
        : 50;

    // Weighted score
    const score =
        completionRate * 0.4 +
        Math.min(streak.current * 2, 20) +
        onTimeRate * 0.3 +
        microProgress * 0.2 +
        priorityRate * 0.1;

    return Math.min(100, Math.round(score));
};

export const getTasksByPriority = (tasks) => {
    return {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
    };
};

export const getCompletionTrend = (tasks, days = 7) => {
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

        const completed = tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return t.status === 'completed' && taskDate >= date && taskDate < nextDate;
        }).length;

        // Format label based on timeframe - ALWAYS show month abbreviation
        let label = '';
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (days <= 7) {
            // Show all labels for 7 days
            label = monthDay;
        } else if (days <= 30) {
            // Show every 5th day for 30 days to reduce clutter
            label = (i % 5 === 0 || i === 0) ? monthDay : '';
        } else if (days <= 90) {
            // Show every 15th day for 90 days
            label = (i % 15 === 0 || i === 0) ? monthDay : '';
        } else {
            // Show very sparse for All (every 20th)
            label = (i % 20 === 0 || i === 0) ? monthDay : '';
        }

        trend.push({
            date: label,
            count: completed,
        });
    }

    return trend;
};
