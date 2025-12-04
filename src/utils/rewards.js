// Reward and app blocking utilities

// Check if app is currently locked
export const isAppLocked = (appData, tasks = [], currentDate = new Date()) => {
    const today = currentDate.toDateString();

    // 1. Check if there's a pending task linked to this app
    const lockingTask = tasks.find(t =>
        t.status !== 'completed' &&
        t.lockedAppIds?.includes(appData.id)
    );

    // If no task is locking this app, it's always UNLOCKED
    if (!lockingTask) return false;

    // 2. If there IS a locking task, check the 30-minute free window
    // Reset usage if it's a new day
    if (appData.lastResetDate !== today) {
        return false; // New day, usage reset to 0, so it's unlocked
    }

    // Check if used time >= 30 minutes
    // If used < 30 mins, it's UNLOCKED (Free Window)
    // If used >= 30 mins, it's LOCKED (because task is pending)
    return appData.usedToday >= 30;
};

// Get the reason why an app is locked
export const getLockReason = (appData, tasks = []) => {
    const lockingTask = tasks.find(t =>
        t.status !== 'completed' &&
        t.lockedAppIds?.includes(appData.id)
    );

    if (!lockingTask) return null;

    if (appData.usedToday >= 30) {
        return `Free window used. Complete '${lockingTask.title}' to unlock.`;
    }

    return null;
};

// Get remaining free time for app today
export const getRemainingTime = (appData, tasks = [], currentDate = new Date()) => {
    const today = currentDate.toDateString();

    // Reset if new day
    if (appData.lastResetDate !== today) {
        return 30;
    }

    return Math.max(0, 30 - appData.usedToday);
};

// Format minutes to readable time
export const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Default blocked apps list
export const DEFAULT_APPS = [
    { id: 'instagram', name: 'Instagram', icon: '📷', packageName: 'com.instagram.android' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', packageName: 'com.google.android.youtube' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', packageName: 'com.zhiliaoapp.musically' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', packageName: 'com.twitter.android' },
    { id: 'facebook', name: 'Facebook', icon: '👥', packageName: 'com.facebook.katana' },
    { id: 'snapchat', name: 'Snapchat', icon: '👻', packageName: 'com.snapchat.android' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', packageName: 'com.whatsapp' },
    { id: 'reddit', name: 'Reddit', icon: '🤖', packageName: 'com.reddit.frontpage' },
];
