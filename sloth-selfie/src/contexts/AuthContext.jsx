import React, { useState, useRef, createContext, useEffect } from 'react';
import { toastInfo } from '../utils/swalUtils';

import socket from '../services/socket/socket';
import { apiService } from '../services/apiService';
import { bufferToBase64, urlBase64ToUint8Array } from '../utils/utils';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const userRef = useRef(false);

    const fetchUserData = async () => {
        let base64Image = '';
        const response = await apiService('/user/profile');
        if (response?.user) {
            if (response.user.image?.data?.data) {
                base64Image = `data:${response.user.image.contentType};base64,${bufferToBase64(response.user.image.data.data)}`;
            }

            const formattedBirthday = response.user.birthday ? new Date(response.user.birthday).toISOString().split('T')[0] : '';
            
            const newUser = {
                _id: response.user._id || '',
                name: response.user.name || '',
                username: response.user.username || '',
                email: response.user.email || '',
                birthday: formattedBirthday,
                phoneNumber: response.user.phoneNumber || '',
                gender: response.user.gender || '',
                profile_image: base64Image,
                workingHours: {
                    start: response.user.workingHours.start || '',
                    end: response.user.workingHours.end || '',
                },
                freeDays: response.user.freeDays || [''],
                noAvailability: response.user.noAvailability || [],
            };
            
            // Only update if ID changed or user was null
            if (!userRef.current || userRef.current._id !== newUser._id) {
                userRef.current = newUser;
                setUser(newUser);
            }

        } else {
            console.error('Error fetching profile data:', response);
            userRef.current = null;
            setUser(null);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const response = await apiService('/user/check-auth');
                if (response.success) {
                    await fetchUserData();
                } else {
                    console.error('Error checking auth:', response);
                    userRef.current = null;
                    if (isMounted) setUser(null);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                userRef.current = null;
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => console.log('Notification permission:', permission));
        }
    }, []);

    useEffect(() => {
        if (!user?._id || Notification.permission !== 'granted') return;
        (async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');

                let subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                    const key = process.env.REACT_APP_VAPID_PUBLIC_KEY;
                    const appKey = urlBase64ToUint8Array(key);
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: appKey
                    });
                    console.log('New subscription:', subscription);
                }
                await apiService('/subscribe', 'POST', subscription);
            } catch (err) {
                console.error('SW/Push error:', err);
            }
        })();
    }, [user]);

    useEffect(() => {
        if (user?._id) socket.connect();
        else socket.disconnect();
    }, [user]);

    useEffect(() => {
        if (!user?._id || Notification.permission !== 'granted') return;

        const handler = ({ title, body, notificationId }) => {
            console.log('Notification received:', { title, body, notificationId });
            toastInfo(title, body);
        };
        socket.on('system-notification', handler);

        return () => socket.off('system-notification', handler);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUserData, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };