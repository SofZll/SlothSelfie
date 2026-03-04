//const BASE_URL = 'http://localhost:3000/api';
const BASE_URL = 'https://site232453.tw.cs.unibo.it/api';

// General API service to make requests to the server
const apiService = async (endpoint, method = 'GET', body = null) => {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        credentials: 'include',
        headers: {},
    };
    if (body && !(body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    } else if (body instanceof FormData) { //case of .ics file upload
        //not setting 'Content-Type', the browser does it automatically with the right boundary
        options.body = body;
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error('API Service Error:', response);
            return await response.json();
        }

        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('text/calendar')) {
            //If it is a calendar file (ICS), return a blob
            return response.blob();
        }

        return await response.json();
    } catch (error) {
        console.error('API Service Error:', error);
        throw error;
    }
};

export { apiService };