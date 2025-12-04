import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassView } from './GlassView';

export default function StreakDisplay({ current, longest, status }) {
    const getStreakColor = () => {
        switch (status) {
            case 'active':
                return 'rgba(52, 199, 89, 0.4)';
            case 'at-risk':
                return 'rgba(255, 204, 0, 0.4)';
            case 'broken':
                return 'rgba(255, 59, 48, 0.3)';
            default:
                return 'rgba(99, 102, 241, 0.3)';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'at-risk':
                return 'At Risk';
            case 'broken':
                return 'Broken';
            default:
                return 'Inactive';
        }
    };

    const getStatusHint = () => {
        switch (status) {
            case 'active':
                return 'Keep it up!';
            case 'at-risk':
                return 'Complete a task today';
            case 'broken':
                return 'Start a new streak';
            default:
                return 'Complete tasks daily';
        }
    };

    return (
        <GlassView style={styles.container} glowColor={getStreakColor()}>
            <View style={styles.header}>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
                <View style={styles.streakInfo}>
                    <Text style={styles.currentStreak}>{current} Day Streak</Text>
                    <Text style={styles.hintText}>{getStatusHint()}</Text>
                </View>
            </View>

            {longest > 0 && (
                <View style={styles.footer}>
                    <Text style={styles.longestLabel}>Best Streak</Text>
                    <Text style={styles.longestValue}>{longest} days</Text>
                </View>
            )}
        </GlassView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statusBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    streakInfo: {
        flex: 1,
    },
    currentStreak: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    hintText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    footer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    longestLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    longestValue: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
