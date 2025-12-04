import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassView } from './GlassView';

export default function StatsCard({ value, label, trend, glowColor = 'rgba(99, 102, 241, 0.3)', unit = '' }) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return '+';
        if (trend < 0) return '-';
        return '';
    };

    const getTrendColor = () => {
        if (!trend) return 'rgba(255,255,255,0.5)';
        if (trend > 0) return '#34C759';
        if (trend < 0) return '#FF3B30';
        return 'rgba(255,255,255,0.5)';
    };

    return (
        <GlassView style={styles.card} glowColor={glowColor}>
            <Text style={styles.value}>
                {value}
                {unit && <Text style={styles.unit}>{unit}</Text>}
            </Text>
            <Text style={styles.label}>{label}</Text>
            {trend !== undefined && trend !== null && (
                <Text style={[styles.trend, { color: getTrendColor() }]}>
                    {getTrendIcon()} {Math.abs(trend)}%
                </Text>
            )}
        </GlassView>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    value: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    unit: {
        fontSize: 20,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    label: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    trend: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
    },
});
