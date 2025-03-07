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

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error('API Service Error:', response);
        }

        return response.json();
    } catch (error) {
        console.error('API Service Error:', error);
        return null;
    }
};

const fetchProfileData = async () => {
    // Since the image is stored a Buffer we need to convert it to base64
    let base64Image = '';
    const bufferToBase64 = (buffer) => {
        const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
        return btoa(binary);
    };
    
    try {
        const response = await apiService('/user/profile');
        if (response) {
            if (response.user.image?.data?.data) {
                const buffer = response.user.image.data.data;
                base64Image = `data:${response.user.image.contentType};base64,${bufferToBase64(buffer)}`;
            }

            const formattedBirthday = response.user.birthday ? new Date(response.user.birthday).toISOString().split('T')[0] : '';

            return {
                name: response.user.name || '',
                username: response.user.username || '',
                email: response.user.email || '',
                birthday: formattedBirthday,
                phoneNumber: response.user.phoneNumber || '',
                gender: response.user.gender || '',
                profile_image: base64Image
            };
        } else {
            console.error('Error fetching profile data:', response);
            return null;
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
};

export { apiService, fetchProfileData };