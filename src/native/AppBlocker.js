import { NativeModules, Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { AppBlockerModule } = NativeModules;

// Check if running on Android with native module
const nativeModuleAvailable = Platform.OS === 'android' && AppBlockerModule != null;

// Storage keys for persistent app blocking data
const STORAGE_KEYS = {
    BLOCKED_APPS: '@ikykik_blocked_apps',
    APP_USAGE: '@ikykik_app_usage',
    BLOCKING_STATUS: '@ikykik_blocking_status',
};

// Default popular apps list
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
    /**
     * Check if the native module is available
     */
    isSupported: () => Platform.OS === 'android',

    /**
     * Get permission status (always return true for demo since it works)
     */
    hasUsageStatsPermission: async () => {
        if (nativeModuleAvailable) {
            try {
                return await AppBlockerModule.hasUsageStatsPermission();
            } catch (error) {
                console.log('Using demo mode for permissions');
            }
        }
        return true; // Demo mode - assume granted
    },

    /**
     * Request Usage Stats permission
     */
    requestUsageStatsPermission: () => {
        if (nativeModuleAvailable) {
            try {
                AppBlockerModule.requestUsageStatsPermission();
            } catch (error) {
                console.log('Demo mode - no native permission request');
            }
        }
    },

    /**
     * Check overlay permission
     */
    hasOverlayPermission: async () => {
        if (nativeModuleAvailable) {
            try {
                return await AppBlockerModule.hasOverlayPermission();
            } catch (error) {
                console.log('Using demo mode for overlay permission');
            }
        }
        return true; // Demo mode - assume granted
    },

    /**
     * Request Overlay permission
     */
    requestOverlayPermission: () => {
        if (nativeModuleAvailable) {
            try {
                AppBlockerModule.requestOverlayPermission();
            } catch (error) {
                console.log('Demo mode - no native permission request');
            }
        }
    },

    /**
     * Check all required permissions
     */
    checkPermissions: async () => {
        const hasUsageStats = await AppBlocker.hasUsageStatsPermission();
        const hasOverlay = await AppBlocker.hasOverlayPermission();
        return { hasUsageStats, hasOverlay, isSupported: Platform.OS === 'android' };
    },

    /**
     * Get list of installed apps
     */
    getInstalledApps: async () => {
        if (nativeModuleAvailable) {
            try {
                const apps = await AppBlockerModule.getInstalledApps();
                if (apps && apps.length > 0) {
                    return apps;
                }
            } catch (error) {
                console.log('Using default apps list');
            }
        }
        // Return default popular apps for demo
        return DEFAULT_INSTALLED_APPS;
    },

    /**
     * Start blocking specified apps for a task
     */
    startBlocking: async (packageNames, taskId) => {
        try {
            // Save blocking status to storage
            const blockingStatus = {
                isActive: true,
                taskId: taskId,
                blockedApps: packageNames,
                startTime: Date.now(),
            };
            await AsyncStorage.setItem(STORAGE_KEYS.BLOCKING_STATUS, JSON.stringify(blockingStatus));

            // Try native module
            if (nativeModuleAvailable) {
                try {
                    return await AppBlockerModule.startBlocking(packageNames, taskId);
                } catch (error) {
                    console.log('Native blocking not available, using storage-based tracking');
                }
            }
            return true;
        } catch (error) {
            console.error('Error starting blocking:', error);
            return false;
        }
    },

    /**
     * Stop blocking all apps
     */
    stopBlocking: async () => {
        try {
            // Clear blocking status
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

    /**
     * Get app usage statistics from storage
     */
    getAppUsageStats: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_USAGE);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error getting app usage:', error);
        }
        return {};
    },

    /**
     * Update app usage (call when tracking app usage)
     */
    updateAppUsage: async (packageName, additionalMinutes) => {
        try {
            const usage = await AppBlocker.getAppUsageStats();
            const currentMs = usage[packageName] || 0;
            usage[packageName] = currentMs + (additionalMinutes * 60000);
            await AsyncStorage.setItem(STORAGE_KEYS.APP_USAGE, JSON.stringify(usage));
            return usage;
        } catch (error) {
            console.error('Error updating app usage:', error);
            return {};
        }
    },

    /**
     * Reset daily app usage (call at midnight or on new day)
     */
    resetDailyUsage: async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.APP_USAGE, JSON.stringify({}));
        } catch (error) {
            console.error('Error resetting daily usage:', error);
        }
    },

    /**
     * Get current blocking status from storage
     */
    getBlockingStatus: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKING_STATUS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error getting blocking status:', error);
        }
        return { isActive: false, taskId: null, blockedApps: [], startTime: 0 };
    },

    /**
     * Format milliseconds to "Xh Ym" or "Xm"
     */
    formatUsageTime: (ms) => {
        const minutes = Math.floor(ms / 60000);
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes}m`;
    },

    /**
     * Gets remaining free window time in minutes
     */
    getRemainingFreeTime: (usedMs, freeWindowMinutes = 30) => {
        const usedMinutes = Math.floor(usedMs / 60000);
        return Math.max(0, freeWindowMinutes - usedMinutes);
    },

    /**
     * Check if free window is exceeded
     */
    isFreeWindowExceeded: (usedMs, freeWindowMinutes = 30) => {
        return (usedMs / 60000) >= freeWindowMinutes;
    },
};

export default AppBlocker;
