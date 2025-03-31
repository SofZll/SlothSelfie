import React, { useState, createContext, useEffect } from 'react';

import { apiService } from '../services/apiService';
import { bufferToBase64 } from '../utils/utils';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        let base64Image = '';
        const response = await apiService('/user/profile');
        if (response) {
            if (response.user.image?.data?.data) {
                base64Image = `data:${response.user.image.contentType};base64,${bufferToBase64(response.user.image.data.data)}`;
            }

            const formattedBirthday = response.user.birthday ? new Date(response.user.birthday).toISOString().split('T')[0] : '';
            
            setUser({
                _id: response.user._id || '',
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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await apiService('/user/check-auth');
                if (response) {
                    await fetchUserData();
                } else {
                    console.error('Error checking auth:', response);
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUserData, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };