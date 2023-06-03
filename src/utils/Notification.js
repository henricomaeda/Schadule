/**
 * @file Notification.js
 * @desc Contains notification functions.
 */

// Import PushNotification modules for local notifications.
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from "react-native-push-notification";
import { Platform } from "react-native";

// Must be outside of any component LifeCycle (componentDidMount or constructor).
PushNotification.configure({
    onRegister: (token) => console.log("TOKEN:", token),
    onNotification: (notification) => {
        console.log("Notification received:", notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // Default: true
    // Should the initial notification be popped automatically?
    popInitialNotification: true,

    // Default: true
    // If not using remove notification of do not have Firebase installed:
    requestPermissions: Platform.OS === "ios",
});

// Sets up the notifications by performing necessary configuration steps.
export const setupNotifications = () => {
    cancelScheduledNotifications();
    createNotificationChannel("schadule-channel");
};

// Cancels all scheduled notifications and removes all delivered notifications.
const cancelScheduledNotifications = () => {
    try {
        PushNotification.cancelAllLocalNotifications();
        PushNotification.removeAllDeliveredNotifications();
    }
    catch (error) {
        console.error("Failed to cancel scheduled notifications:", error);
    }
};

/**
 * Creates a notification channel with the given channel ID.
 *
 * @param {string} channelId - The ID of the notification channel to create.
 */
const createNotificationChannel = channelId => {
    try {
        const deleteChannel = (channelIdToRemove) => channelIdToRemove !== channelId && PushNotification.deleteChannel(channelIdToRemove);
        PushNotification.getChannels((channelIds) => channelIds.forEach(channelId => deleteChannel(channelId)));
        const channelName = "Eventos criados";
        const channelDescription = "Um canal para gerenciar as notificações agendadas do Schadule.";
        PushNotification.createChannel(
            {
                vibrate: false,
                soundName: "default",
                channelId: channelId,
                channelName: channelName,
                importance: Importance.HIGH,
                channelDescription: channelDescription,
            },
            created => {
                if (created) console.log("The notification channel was successfully created!");
                else console.warn("The notification channel has already been created!");
            }
        );
    }
    catch (error) {
        console.error("Failed to create a notification channel:", error);
    }
};

// Schedules a local notification.
export const scheduleNotification = (title, subtitle, date, teenMinutesBefore = false) => {
    try {
        const message = teenMinutesBefore ? "Acontecerá em 10 minutes!" : "Acontecendo agora!";
        const trigger = new Date(date).setMilliseconds(0);
        const moreSeconds = trigger.getSeconds() + 2;
        if (trigger <= new Date()) trigger.setSeconds(moreSeconds);
        PushNotification.localNotificationSchedule({
            importance: "high",
            priority: "high",
            date: date,
            when: date,
            title: title,
            message: message,
            bigText: message,
            subText: subtitle,
            channelId: "schadule-channel",
            invokeApp: true
        });
    }
    catch (error) {
        console.error("Failed to schedule a notification:", error);
    }
};
