/**
 * @file dataStorage.js
 * @desc This file provides functions to store, retrieve, and remove data from the AsyncStorage module.
 * AsyncStorage is a key-value storage system provided by React Native for persistent data storage.
 * Each function performs a specific operation on the stored data.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stores the provided data with the given key in AsyncStorage.
 * If json is true, the data is stringified before being stored.
 *
 * @param {string} key - The key to use when storing the data.
 * @param {*} value - The data to store.
 * @param {boolean} [json=false] - Whether to stringify the data before storing it.
 */
export const storeData = async (key, value, json = false) => {
    try {
        const data = json ? JSON.stringify(value) : value;
        await AsyncStorage.setItem(key, data);
    }
    catch (error) {
        console.error('Error occurred while saving data:', error);
    }
};

/**
 * Retrieves the data stored under the given key in AsyncStorage.
 * If json is true, the retrieved data is parsed as JSON.
 *
 * @param {string} key - The key of the data to retrieve.
 * @param {boolean} [json=false] - Whether to parse the retrieved data as JSON.
 * @returns {Promise<*>} - The retrieved data or null if no data is found.
 */
export const getData = async (key, json = false) => {
    try {
        const value = await AsyncStorage.getItem(key);
        const data = json ? JSON.parse(value) : value;
        if (value !== null && data) return data;
        else if (json) return [];
    }
    catch (error) {
        console.error('Error occurred while retrieving data:', error);
    }
};

/**
 * Removes the data stored under the given key from AsyncStorage.
 * @param {string} key - The key of the data to remove.
 */
export const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    }
    catch (error) {
        console.error('Error occurred while removing data:', error);
    }
};