/**
 * AppBlocker - Native Android App Blocking Module
 * 
 * Bridges React Native to native Kotlin code for:
 * - Getting installed apps
 * - Blocking apps during focused work
 * - Tracking app usage time
 */

import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { AppBlockerModule } = NativeModules;

// Check if running on Android with native module
const nativeModuleAvailable = Platform.OS === 'android' && AppBlockerModule != null;

// Storage keys
const STORAGE_KEYS = {
    BLOCKED_APPS: '@ikykik_blocked_apps',
    APP_USAGE: '@ikykik_app_usage',
    BLOCKING_STATUS: '@ikykik_blocking_status',
};

// Default apps list (fallback)
const DEFAULT_INSTALLED_APPS = [
    { packageName: 'com.instagram.android', appName: 'Instagram' },
    { packageName: 'com.google.android.youtube', appName: 'YouTube' },
    { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok' },
    { packageName: 'com.twitter.android', appName: 'Twitter' },
    { packageName: 'com.facebook.katana', appName: 'Facebook' },
    { packageName: 'com.whatsapp', appName: 'WhatsApp' },
    { packageName: 'com.snapchat.android', appName: 'Snapchat' },
    { packageName: 'com.reddit.frontpage', appName: 'Reddit' },
    { packageName: 'com.netflix.mediaclient', appName: 'Netflix' },
    { packageName: 'com.spotify.music', appName: 'Spotify' },
    { packageName: 'com.discord', appName: 'Discord' },
    { packageName: 'com.amazon.mShop.android.shopping', appName: 'Amazon' },
];

export const AppBlocker = {
    isSupported: () => Platform.OS === 'android',

    // ==================== PERMISSIONS ====================

    hasUsageStatsPermission: async () => {
        if (nativeModuleAvailable) {
            try {
                return await AppBlockerModule.hasUsageStatsPermission();
            } catch (error) {
                console.log('Permission check failed');
            }
        }
        return true;
    },

    requestUsageStatsPermission: () => {
        if (nativeModuleAvailable) {
            try {
                AppBlockerModule.requestUsageStatsPermission();
            } catch (error) {
                console.log('Permission request failed');
            }
        }
    },

    hasOverlayPermission: async () => {
        if (nativeModuleAvailable) {
            try {
                return await AppBlockerModule.hasOverlayPermission();
            } catch (error) {
                console.log('Overlay check failed');
            }
        }
        return true;
    },

    requestOverlayPermission: () => {
        if (nativeModuleAvailable) {
            try {
                AppBlockerModule.requestOverlayPermission();
            } catch (error) {
                console.log('Overlay request failed');
            }
        }
    },

    checkPermissions: async () => {
        const hasUsageStats = await AppBlocker.hasUsageStatsPermission();
        const hasOverlay = await AppBlocker.hasOverlayPermission();
        return { hasUsageStats, hasOverlay, isSupported: Platform.OS === 'android' };
    },

    // ==================== APPS ====================

    getInstalledApps: async () => {
        if (nativeModuleAvailable) {
            try {
                const apps = await AppBlockerModule.getInstalledApps();
                if (apps && apps.length > 0) {
                    return apps;
                }
            } catch (error) {
                console.log('Using default apps');
            }
        }
        return DEFAULT_INSTALLED_APPS;
    },

    // ==================== BLOCKING ====================

    startBlocking: async (packageNames, taskId, taskName = 'your pending task') => {
        try {
            const blockingStatus = {
                isActive: true,
                taskId: taskId,
                taskName: taskName,
                blockedApps: packageNames,
                startTime: Date.now(),
            };
            await AsyncStorage.setItem(STORAGE_KEYS.BLOCKING_STATUS, JSON.stringify(blockingStatus));

            if (nativeModuleAvailable) {
                try {
                    return await AppBlockerModule.startBlocking(packageNames, taskId, taskName);
                } catch (error) {
                    console.log('Native blocking not available');
                }
            }
            return true;
        } catch (error) {
            console.error('Error starting blocking:', error);
            return false;
        }
    },

    stopBlocking: async () => {
        try {
            const emptyStatus = {
                isActive: false,
                taskId: null,
                blockedApps: [],
                startTime: 0,
            };
            await AsyncStorage.setItem(STORAGE_KEYS.BLOCKING_STATUS, JSON.stringify(emptyStatus));

            if (nativeModuleAvailable) {
                try {
                    return await AppBlockerModule.stopBlocking();
                } catch (error) {
                    console.log('Native stop not available');
                }
            }
            return true;
        } catch (error) {
            console.error('Error stopping blocking:', error);
            return false;
        }
    },

    // ==================== USAGE TRACKING ====================

    getAppUsageStats: async () => {
        // Try native first (reads from SharedPreferences that service uses)
        if (nativeModuleAvailable) {
            try {
                const usageJson = await AppBlockerModule.getAppUsageStats();
                return JSON.parse(usageJson || '{}');
            } catch (error) {
                console.log('Native usage stats failed');
            }
        }
        // Fallback
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_USAGE);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            return {};
        }
    },

    updateAppUsage: async (packageName, additionalMinutes) => {
        // Use native module to update SharedPreferences (syncs with service)
        if (nativeModuleAvailable) {
            try {
                const usageJson = await AppBlockerModule.updateAppUsage(packageName, additionalMinutes);
                return JSON.parse(usageJson || '{}');
            } catch (error) {
                console.log('Native update failed, using fallback');
            }
        }
        // Fallback
        try {
            const usage = await AppBlocker.getAppUsageStats();
            const currentMs = usage[packageName] || 0;
            // Cap at 30 minutes
            usage[packageName] = Math.min(currentMs + (additionalMinutes * 60000), 30 * 60000);
            await AsyncStorage.setItem(STORAGE_KEYS.APP_USAGE, JSON.stringify(usage));
            return usage;
        } catch (error) {
            return {};
        }
    },

    resetDailyUsage: async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.APP_USAGE, JSON.stringify({}));
        } catch (error) {
            console.error('Error resetting usage');
        }
    },

    getBlockingStatus: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKING_STATUS);
            return stored ? JSON.parse(stored) : { isActive: false, taskId: null, blockedApps: [], startTime: 0 };
        } catch (error) {
            return { isActive: false, taskId: null, blockedApps: [], startTime: 0 };
        }
    },

    // ==================== UTILITIES ====================

    formatUsageTime: (ms) => {
        const minutes = Math.floor(ms / 60000);
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remaining = minutes % 60;
            return `${hours}h ${remaining}m`;
        }
        return `${minutes}m`;
    },

    getRemainingFreeTime: (usedMs, freeWindowMinutes = 30) => {
        const usedMinutes = Math.floor(usedMs / 60000);
        return Math.max(0, freeWindowMinutes - usedMinutes);
    },

    isFreeWindowExceeded: (usedMs, freeWindowMinutes = 30) => {
        return (usedMs / 60000) >= freeWindowMinutes;
    },
};

export default AppBlocker;
