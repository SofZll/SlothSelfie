const BASE_URL = 'http://localhost:3000/api';

// General API service to make requests to the server
const apiService = async (endpoint, method = 'GET', body = null) => {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return { success: false, message: errorData.message };
        }

        return await response.json();
    } catch (error) {
        console.error('API Service Error:', error);
        return { success: false, message: error.message };
    }
};

export { apiService };