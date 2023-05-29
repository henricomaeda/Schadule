// Import required modules and dependencies.
import { name as appName } from "../app.json";
import { Dimensions } from "react-native";

// Get the window dimensions and current hour.
const window = Dimensions.get("window");
const currentHour = new Date().getHours();

// Determine the main color based on the current hour.
//export const mainColors = ["#171769", "#3291FF", "#0048FF", "#0000FF"];
export const mainColors = ["#fddbab", "#a8f0fe", "#f58784", "#5d58bc"];
const gradientColors = [
    currentHour < 6 ? mainColors[1] : currentHour < 12 ? mainColors[2] : currentHour < 18 ? mainColors[3] : mainColors[0],
    currentHour < 6 ? mainColors[0] : currentHour < 12 ? mainColors[1] : currentHour < 18 ? mainColors[2] : mainColors[3],
    currentHour < 6 ? mainColors[3] : currentHour < 12 ? mainColors[0] : currentHour < 18 ? mainColors[1] : mainColors[2]
]

/**
 * Global variables and configurations.
 *
 * @property {Object} app - Application related variables.
 * @property {string} app.name - The name of the application.
 * @property {number} app.width - The width of the application window.
 * @property {number} app.height - The height of the application window.
 * @property {number} app.circle - The border radius calculed to be an circle.
 * @property {Object} colors - Color variables.
 * @property {string} colors.main - The main color based on the current hour.
 * @property {string} colors.gradient - The gradient colors.
 * @property {string} colors.background - The background color.
 * @property {string} colors.midground - The midground color.
 * @property {string} colors.foreground - The foreground color.
 * @property {string} colors.placeholder - The placeholder color.
 * @property {string} colors.tint - The tint color.
 */
export const globals = {
    app: {
        name: appName,
        width: window.width,
        height: window.height,
        circle: Math.round(window.width + window.height) / 2
    },
    colors: {
        gradient: gradientColors,
        background: "#121212",
        midground: "#222222",
        foreground: "#444444",
        placeholder: "#AAAAAA",
        tint: "#FFFFFF"
    },
    months: [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ],
    weekDays: [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
    ]
};
