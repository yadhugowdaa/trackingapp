import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProgressBar({ completed, total, style }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressWidth = `${percentage}%`;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.text}>
                {completed}/{total} • {percentage}%
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#34C759',
        borderRadius: 4,
    },
    text: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        minWidth: 70,
    },
});
