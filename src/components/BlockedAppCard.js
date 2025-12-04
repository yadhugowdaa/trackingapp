import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GlassView } from './GlassView';
import { formatTime } from '../utils/rewards';

export default function BlockedAppCard({ app, onUseTime, isLocked, lockReason, remainingTime }) {
    const dailyLimit = 30; // Fixed 30 min limit
    const usagePercent = Math.min(100, (app.usedToday / dailyLimit) * 100).toFixed(0);

    return (
        <GlassView style={styles.card} glowColor={isLocked ? 'rgba(255, 59, 48, 0.3)' : 'rgba(52, 199, 89, 0.3)'}>
            <View style={styles.header}>
                <View style={styles.appInfo}>
                    <Text style={styles.icon}>{app.icon}</Text>
                    <View>
                        <Text style={styles.appName}>{app.name}</Text>
                        <Text style={styles.limit}>30m Free Window / Day</Text>
                    </View>
                </View>
            </View>

            {/* Usage Bar */}
            <View style={styles.usageContainer}>
                <View style={styles.usageBar}>
                    <View style={[styles.usageBarFill, {
                        width: `${usagePercent}%`,
                        backgroundColor: isLocked ? '#FF3B30' : '#34C759'
                    }]} />
                </View>
                <Text style={styles.usageText}>
                    Used: {formatTime(app.usedToday)} / 30m
                </Text>
            </View>

            {/* Status */}
            <View style={styles.status}>
                {isLocked ? (
                    <View style={styles.lockedBadge}>
                        <Text style={styles.lockedIcon}>🔒</Text>
                        <Text style={styles.lockedText}>{lockReason || 'Locked'}</Text>
                    </View>
                ) : (
                    <Text style={styles.remainingText}>
                        {formatTime(remainingTime)} remaining in free window
                    </Text>
                )}
            </View>

            {/* Simulate Use Button (for testing) */}
            <TouchableOpacity
                style={[styles.useButton, isLocked && styles.useButtonDisabled]}
                onPress={onUseTime}
            >
                <Text style={styles.useButtonText}>
                    {isLocked ? 'App Locked' : 'Simulate 5 min use'}
                </Text>
            </TouchableOpacity>
        </GlassView>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    appInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    icon: {
        fontSize: 40,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    limit: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    usageContainer: {
        marginBottom: 12,
    },
    usageBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    usageBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    usageText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    status: {
        marginBottom: 12,
    },
    lockedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    lockedIcon: {
        fontSize: 16,
    },
    lockedText: {
        fontSize: 13,
        color: '#FF3B30',
        fontWeight: '600',
        flex: 1,
    },
    remainingText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    useButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
    },
    useButtonDisabled: {
        opacity: 0.5,
        borderColor: 'transparent',
    },
    useButtonText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
});
