/**
 * Schadule Mobile App
 *
 * Entry point for the Schadule mobile application. It registers the main
 * component with the React Native AppRegistry for navigation purposes.
 *
 * @format
 * @flow
 * @providesModule Schadule
 * @flow strict-local
 * @module Schadule
 */

// Import the application's name and main component.
import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import App from './src/App';

// Register the navigation component.
AppRegistry.registerComponent(appName, () => App);
