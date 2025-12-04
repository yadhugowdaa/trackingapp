import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
        // console.log(token);
    } else {
        // alert('Must use physical device for Push Notifications');
    }

    return token;
}

// Schedule a notification for a task deadline
export async function scheduleTaskNotification(task) {
    if (!task.deadline) return;

    const deadlineDate = new Date(task.deadline);
    const now = new Date();

    // Don't schedule if deadline is in the past
    if (deadlineDate <= now) return;

    // Schedule for the exact deadline
    const trigger = deadlineDate;

    try {
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Task Deadline! ⏰",
                body: `"${task.title}" is due now!`,
                data: { taskId: task.id },
            },
            trigger,
        });
        return identifier;
    } catch (error) {
        console.log("Error scheduling notification:", error);
        return null;
    }
}

// Cancel a specific notification
export async function cancelTaskNotification(notificationId) {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.log("Error cancelling notification:", error);
    }
}

// Cancel all notifications for a specific task (if we stored IDs differently, but for now we'll rely on stored ID)
export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
