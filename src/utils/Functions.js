// Import required global variables.
import { globals } from "../Globals";

/**
 * Generate a unique ID based on the given data.
 *
 * @param {Array} data - An array of objects containing ID properties.
 * @returns {number} - A unique ID that doesn't exist in the data.
 */
export const generateUniqueId = data => {
    // Create a set of existing IDs from the data
    const idSet = new Set(data.map(item => item.id));

    // Initialize the ID to 0 and find an available unique ID.
    let id = 0; while (idSet.has(id)) id++;

    // Return the unique ID
    return id;
};

/**
 * Format the time to ensure it has leading zero if less than 10.
 * @param {number} time - The time to format.
 * @returns {string} - The formatted time.
 */
export const formatTime = time => time < 10 ? `0${time}` : `${time}`;

/**
 * Format the date in a specific format.
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date.
 */
export const formatDate = (date, short = true) => {
    const day = date.getDate();
    const month = globals.months[date.getMonth()].toLowerCase();
    if (short) {
        const weekDay = globals.weekDays[date.getDay()];
        return `${weekDay}, ${day} de ${month}`;
    }
    else return `${day} de ${month} de ${date.getFullYear()}`;
};
