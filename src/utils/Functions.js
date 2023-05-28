/**
 * Generates a unique ID based on the given data.
 *
 * @param {Array} data - An array of objects containing ID properties.
 * @returns {number} - A unique ID that doesn't exist in the data.
 */
export const generateUniqueId = (data) => {
    // Create a set of existing IDs from the data
    const idSet = new Set(data.map(item => item.id));

    // Initialize the ID to 0 and find an available unique ID.
    let id = 0; while (idSet.has(id)) id++;

    // Return the unique ID
    return id;
};