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
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options)
        .then(res => res.json())
        .catch(error => console.error('Error API:', error.message));
    
    return response;
};

export default apiService;