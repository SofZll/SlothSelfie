import Swal from 'sweetalert2';
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
            console.error('API Service Error:', response);
            return null;
        }


        return await response.json();
    } catch (error) {
        console.error('API Service Error:', error);
        throw error;
    }
};

export { apiService };