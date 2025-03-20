import React, { useState, createContext, useEffect } from 'react';

import { apiService } from '../services/apiService';

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState([]);

    const fetchUserData = async () => {
        // Since the image is stored a Buffer we need to convert it to base64
        let base64Image = '';
        const bufferToBase64 = (buffer) => {
            const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
            return btoa(binary);
        };
        const response = await apiService('/user/profile');
        if (response) {
            if (response.user.image?.data?.data) {
                const buffer = response.user.image.data.data;
                base64Image = `data:${response.user.image.contentType};base64,${bufferToBase64(buffer)}`;
            }

            const formattedBirthday = response.user.birthday ? new Date(response.user.birthday).toISOString().split('T')[0] : '';
            
            setUser({
                name: response.user.name || '',
                username: response.user.username || '',
                email: response.user.email || '',
                birthday: formattedBirthday,
                phoneNumber: response.user.phoneNumber || '',
                gender: response.user.gender || '',
                profile_image: base64Image
            });
        } else {
            console.error('Error fetching profile data:', response);
        }
    };

    useEffect(() => { fetchUserData(); }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export { UserContext, UserProvider };