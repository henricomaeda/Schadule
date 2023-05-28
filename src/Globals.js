// Import required modules and dependencies.
import { name as appName } from "../app.json";
import { Dimensions } from "react-native";

// Get the window dimensions and current hour.
const window = Dimensions.get("window");
const currentHour = new Date().getHours();

// Determine the main color based on the current hour.
const mainColor = currentHour < 6 ? "#7E5BFF" : currentHour < 12 ? "#3291FF" : currentHour < 18 ? "#0048FF" : "#0000FF";

/**
 * Global variables and configurations.
 *
 * @property {Object} app - Application related variables.
 * @property {string} app.name - The name of the application.
 * @property {number} app.width - The width of the application window.
 * @property {number} app.height - The height of the application window.
 * @property {Object} colors - Color variables.
 * @property {string} colors.tint - The tint color.
 * @property {string} colors.placeholder - The placeholder color.
 * @property {string} colors.foreground - The foreground color.
 * @property {string} colors.midground - The midground color.
 * @property {string} colors.background - The background color.
 * @property {string} colors.main - The main color based on the current hour.
 */
export const globals = {
    app: {
        name: appName,
        width: window.width,
        height: window.height
    },
    colors: {
        tint: "#FFFFFF",
        placeholder: "#AAAAAA",
        foreground: "#444444",
        midground: "#222222",
        background: "#121212",
        main: mainColor,
    }
};
