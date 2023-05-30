// Import axios to request data.
import axios from "axios";

// Fetches holidays from Brazil's API for the current year.
const fetchHolidays = async () => {
    try {
        const currentYear = new Date().getFullYear();
        const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${currentYear}`);
        return response.data;
    }
    catch (error) {
        console.error('Error occurred while fetching holidays:', error);
        return [];
    }
};

export default fetchHolidays;
