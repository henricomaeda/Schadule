/**
 * @file Navigation.js
 * @desc Contains navigation functions using react-navigation.
 */

// Import the StackActions module from react-navigation.
import { StackActions } from '@react-navigation/native';

/**
 * Navigates to a screen.
 * @param {Object} navigation - The navigation object.
 * @param {string} screenName - The name of the screen to navigate to.
 * @param {Array} data - Optional data to pass to the screen.
 */
export const navigateToScreen = (navigation, screenName, data = null) => {
    try {
        // Check if data is provided and push the screen with data if available.
        if (data !== null) {
            data = JSON.stringify(data);
            navigation.dispatch(StackActions.push(screenName, data));
        } else {
            // Push the screen without data.
            navigation.dispatch(StackActions.push(screenName));
        }
    } catch (error) {
        console.error('Error navigating to screen:', error);
    }
}

/**
 * Replaces the current route with a new screen.
 * @param {Object} navigation - The navigation object.
 * @param {string} screenName - The name of the screen to replace with.
 */
export const replaceRoute = (navigation, screenName) => {
    try {
        // Replace the current route with the specified screen.
        navigation.dispatch(StackActions.replace(screenName));
    } catch (error) {
        console.error('Error replacing route:', error);
    }
}

/**
 * Navigates to the home screen.
 * @param {Object} navigation - The navigation object.
 */
export const navigateToHome = (navigation) => {
    try {
        // Check if the current screen is already at the top of the stack.
        const isFocused = navigation.isFocused();
        if (!isFocused) navigation.popToTop();

        // Navigate the user to the main screen.
        navigation.dispatch(StackActions.popToTop());
    } catch (error) {
        console.error('Error navigating to home screen:', error);
    }
}