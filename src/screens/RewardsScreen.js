import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { GlassView } from '../components/GlassView';
import AppBlocker from '../native/AppBlocker';

// Color palette for app avatars
const APP_COLORS = [
    '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
    '#FF9800', '#FF5722', '#795548', '#607D8B',
];

const getColorForApp = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return APP_COLORS[Math.abs(hash) % APP_COLORS.length];
};

export default function RewardsScreen({ appUsage = [], tasks = [], onUpdateAppUsage, onClose }) {
    const [apps, setApps] = useState([]);
    const [usageStats, setUsageStats] = useState({});
    const [blockingStatus, setBlockingStatus] = useState({ isActive: false, blockedApps: [] });

    useEffect(() => {
        loadAppsAndUsage();
    }, []);

    const loadAppsAndUsage = async () => {
        // Load installed apps
        const installedApps = await AppBlocker.getInstalledApps();
        const appsWithAvatars = installedApps.map(app => ({
            id: app.packageName,
            name: app.appName,
            packageName: app.packageName,
            color: getColorForApp(app.appName),
            dailyLimit: 30,
        }));
        setApps(appsWithAvatars);

        // Load usage stats
        const usage = await AppBlocker.getAppUsageStats();
        setUsageStats(usage);

        // Load blocking status
        const status = await AppBlocker.getBlockingStatus();
        setBlockingStatus(status);
    };

    const handleTrackUsage = async (packageName) => {
        // Add 5 minutes of usage
        const newUsage = await AppBlocker.updateAppUsage(packageName, 5);
        setUsageStats(newUsage);
    };

    const getUsedMinutes = (packageName) => {
        const ms = usageStats[packageName] || 0;
        return Math.floor(ms / 60000);
    };

    const getRemainingMinutes = (packageName) => {
        const usedMs = usageStats[packageName] || 0;
        return AppBlocker.getRemainingFreeTime(usedMs, 30);
    };

    const isAppBlocked = (packageName) => {
        return blockingStatus.blockedApps?.includes(packageName) || false;
    };

    // Get first letter for avatar
    const getInitial = (name) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Apps</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info Card */}
                <GlassView style={styles.infoCard} glowColor="rgba(99, 102, 241, 0.3)">
                    <Text style={styles.infoTitle}>App Limits</Text>
                    <Text style={styles.infoText}>
                        • All apps have a 30-minute free window each day.{'\n'}
                        • After 30 mins, apps LOCK if you have pending tasks linked to them.{'\n'}
                        • Complete the linked task to UNLOCK the app.
                    </Text>
                </GlassView>

                {/* Blocking Status */}
                {blockingStatus.isActive && (
                    <GlassView style={styles.activeBlockCard} glowColor="rgba(255, 59, 48, 0.4)">
                        <Text style={styles.activeBlockTitle}>App Blocking Active</Text>
                        <Text style={styles.activeBlockText}>
                            {blockingStatus.blockedApps?.length || 0} apps blocked until task completed
                        </Text>
                    </GlassView>
                )}

                {/* Apps List */}
                <Text style={styles.sectionTitle}>App Usage Today</Text>
                {apps.length === 0 ? (
                    <GlassView style={styles.emptyState} glowColor="rgba(99, 102, 241, 0.2)">
                        <Text style={styles.emptyText}>Loading apps...</Text>
                    </GlassView>
                ) : (
                    apps.map(app => {
                        const usedMinutes = getUsedMinutes(app.packageName);
                        const remainingMinutes = getRemainingMinutes(app.packageName);
                        const isBlocked = isAppBlocked(app.packageName);
                        const progress = Math.min(usedMinutes / 30, 1);

                        return (
                            <GlassView
                                key={app.id}
                                style={[styles.appCard, isBlocked && styles.appCardBlocked]}
                                glowColor={isBlocked ? "rgba(255, 59, 48, 0.3)" : "rgba(52, 199, 89, 0.3)"}
                            >
                                <View style={styles.appHeader}>
                                    {/* App Avatar with initial */}
                                    <View style={[styles.appAvatar, { backgroundColor: app.color }]}>
                                        <Text style={styles.appAvatarText}>{getInitial(app.name)}</Text>
                                    </View>
                                    <View style={styles.appInfo}>
                                        <Text style={styles.appName}>{app.name}</Text>
                                        <Text style={styles.appLimit}>30m Free Window / Day</Text>
                                    </View>
                                    {isBlocked && (
                                        <View style={styles.lockedBadge}>
                                            <Text style={styles.lockedBadgeText}>LOCKED</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Progress Bar */}
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${progress * 100}%` },
                                                progress >= 1 && styles.progressFillExceeded
                                            ]}
                                        />
                                    </View>
                                </View>

                                <View style={styles.usageInfo}>
                                    <Text style={styles.usageText}>
                                        Used: {usedMinutes}m / 30m
                                    </Text>
                                    <Text style={[styles.remainingText, remainingMinutes === 0 && styles.remainingTextExceeded]}>
                                        {remainingMinutes > 0
                                            ? `${remainingMinutes}m remaining in free window`
                                            : 'Free window exceeded!'
                                        }
                                    </Text>
                                </View>

                                {/* Only show Track button for apps that are in the blocking list */}
                                {isBlocked && (
                                    <TouchableOpacity
                                        style={styles.trackButton}
                                        onPress={() => handleTrackUsage(app.packageName)}
                                    >
                                        <Text style={styles.trackButtonText}>Track 5 min use</Text>
                                    </TouchableOpacity>
                                )}
                            </GlassView>
                        );
                    })
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
    infoCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
    },
    activeBlockCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    activeBlockTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginBottom: 4,
    },
    activeBlockText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    emptyState: {
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
    },
    appCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    appCardBlocked: {
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    appAvatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    appAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    appInfo: {
        flex: 1,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    appLimit: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    lockedBadge: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    lockedBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#34C759',
        borderRadius: 3,
    },
    progressFillExceeded: {
        backgroundColor: '#FF3B30',
    },
    usageInfo: {
        marginBottom: 12,
    },
    usageText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    remainingText: {
        fontSize: 13,
        color: '#34C759',
    },
    remainingTextExceeded: {
        color: '#FF3B30',
    },
    trackButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    trackButtonText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
});
