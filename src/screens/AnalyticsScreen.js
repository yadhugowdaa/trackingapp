import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import StatsCard from '../components/StatsCard';
import StreakDisplay from '../components/StreakDisplay';
import { GlassView } from '../components/GlassView';
import {
    calculateCompletionRate,
    calculateStreak,
    calculateTaskVelocity,
    calculateProductivityScore,
    getTasksByPriority,
    getCompletionTrend,
} from '../utils/analytics';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen({ tasks, onClose }) {
    const [timeRange, setTimeRange] = useState('7d');

    const completionRate = calculateCompletionRate(tasks, timeRange);
    const streak = calculateStreak(tasks);
    const velocity = calculateTaskVelocity(tasks, 7);
    const productivityScore = calculateProductivityScore(tasks);
    const priorityData = getTasksByPriority(tasks);
    const trend = getCompletionTrend(tasks, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

    const chartConfig = {
        backgroundColor: '#0a0a0f',
        backgroundGradientFrom: '#1a1a2e',
        backgroundGradientTo: '#0a0a0f',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
        style: { borderRadius: 16 },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#6366f1',
        },
    };

    const completedVsPending = [
        {
            name: 'Completed',
            population: tasks.filter(t => t.status === 'completed').length,
            color: '#34C759',
            legendFontColor: '#fff',
            legendFontSize: 14,
        },
        {
            name: 'Pending',
            population: tasks.filter(t => t.status === 'pending').length,
            color: '#FF9500',
            legendFontColor: '#fff',
            legendFontSize: 14,
        },
    ];

    const timeRanges = [
        { label: '7D', value: '7d' },
        { label: '30D', value: '30d' },
        { label: '90D', value: '90d' },
        { label: 'All', value: 'all' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Analytics</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Time Range Selector */}
                <View style={styles.timeRangeContainer}>
                    {timeRanges.map(range => (
                        <TouchableOpacity
                            key={range.value}
                            style={[
                                styles.timeRangeButton,
                                timeRange === range.value && styles.timeRangeButtonActive
                            ]}
                            onPress={() => setTimeRange(range.value)}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                timeRange === range.value && styles.timeRangeTextActive
                            ]}>
                                {range.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <StatsCard
                        value={completionRate}
                        unit="%"
                        label="Completion"
                        glowColor="rgba(52, 199, 89, 0.3)"
                    />
                    <StatsCard
                        value={productivityScore}
                        label="Score"
                        glowColor="rgba(99, 102, 241, 0.4)"
                    />
                </View>

                <View style={styles.statsRow}>
                    <StatsCard
                        value={velocity}
                        label="Tasks/Day"
                        glowColor="rgba(255, 149, 0, 0.3)"
                    />
                    <StatsCard
                        value={tasks.length}
                        label="Total Tasks"
                        glowColor="rgba(175, 82, 222, 0.3)"
                    />
                </View>

                {/* Streak Display */}
                <StreakDisplay current={streak.current} longest={streak.longest} status={streak.status} />

                {/* Line Chart - Completion Trend */}
                {trend.length > 0 && (
                    <GlassView style={styles.chartContainer} glowColor="rgba(99, 102, 241, 0.3)">
                        <Text style={styles.chartTitle}>Tasks Completed Over Time</Text>
                        <LineChart
                            data={{
                                labels: trend.map(t => t.date || ''),
                                datasets: [{ data: trend.map(t => t.count) }],
                            }}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </GlassView>
                )}

                {/* Bar Chart - Priority Distribution */}
                {(priorityData.high + priorityData.medium + priorityData.low) > 0 && (
                    <GlassView style={styles.chartContainer} glowColor="rgba(255, 149, 0, 0.3)">
                        <Text style={styles.chartTitle}>Tasks by Priority</Text>
                        <BarChart
                            data={{
                                labels: ['High', 'Medium', 'Low'],
                                datasets: [{
                                    data: [priorityData.high || 0, priorityData.medium || 0, priorityData.low || 0],
                                }],
                            }}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
                            }}
                            style={styles.chart}
                            showValuesOnTopOfBars
                        />
                    </GlassView>
                )}

                {/* Pie Chart - Status Distribution */}
                {completedVsPending.some(d => d.population > 0) && (
                    <GlassView style={styles.chartContainer} glowColor="rgba(52, 199, 89, 0.3)">
                        <Text style={styles.chartTitle}>Task Status Distribution</Text>
                        <PieChart
                            data={completedVsPending.filter(d => d.population > 0)}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                            style={styles.chart}
                        />
                    </GlassView>
                )}

                {/* Empty State */}
                {tasks.length === 0 && (
                    <GlassView style={styles.emptyState} glowColor="rgba(99, 102, 241, 0.2)">
                        <Text style={styles.emptyTitle}>No Data</Text>
                        <Text style={styles.emptyText}>Create tasks to see analytics</Text>
                    </GlassView>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    backButton: {
        fontSize: 16,
        color: '#0A84FF',
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    timeRangeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    timeRangeButtonActive: {
        backgroundColor: '#0A84FF',
        borderColor: '#0A84FF',
    },
    timeRangeText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    timeRangeTextActive: {
        color: '#FFFFFF',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    chartContainer: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    chart: {
        borderRadius: 16,
    },
    emptyState: {
        padding: 40,
        borderRadius: 28,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
});
