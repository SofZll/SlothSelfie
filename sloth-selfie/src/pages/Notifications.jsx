import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/Notifications.css';
import MainLayout from '../layouts/MainLayout';
import { TimeMachineContext } from '../contexts/TimeMachineContext';
import { useIsDesktop } from '../utils/utils';

import NotificationsUpcoming from './NotificationsUpcoming';
import NotificationsHistory from './NotificationsHistory';

const Notifications = () => {
    const { refreshKey } = useContext(TimeMachineContext);
    const isDesktop = useIsDesktop();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(true);

    const handleNotificationClick = (notif) => {
        const path = `/calendar?type=${notif.elementType}&element=${notif.element._id}`;
        navigate(path);
    }
    
    return (
        <MainLayout>
            <div className={`notifications-container ${isDesktop ? 'desktop' : ''} p-2 h-75 d-flex flex-column h-100`}>
                <div className='d-flex justify-content-around align-items-center mb-2'>
                    <button type='button' className={`btn w-100 p-2 ${showHistory ? 'btn-light bg-white border' : 'btn-primary'}`} onClick={() => setShowHistory(false)}>Upcoming</button>
                    <button type='button' className={`btn w-100 p-2 ${showHistory ? 'btn-secondary' : 'btn-light bg-white border'}`} onClick={() => setShowHistory(true)}>History</button>
                </div>
                {showHistory ? (
                    <NotificationsHistory loading={loading} setLoading={setLoading} refreshKey={refreshKey} handleNotificationClick={handleNotificationClick} />
                ) : (
                    <NotificationsUpcoming loading={loading} setLoading={setLoading} refreshKey={refreshKey} handleNotificationClick={handleNotificationClick} />
                )}
            </div>
        </MainLayout>
    )
}

export default Notifications;