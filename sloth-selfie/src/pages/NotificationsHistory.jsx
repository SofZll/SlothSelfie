import React, { useEffect, useState } from 'react';

import { AlertTriangle } from 'lucide-react';
import { NewSwal } from '../utils/swalUtils';
import { formatDate } from '../utils/utils';

import { LoadingPageDark } from './LoadingPage';
import { apiService } from '../services/apiService';

// creazione evento sharedwith da accettare o rifiutare
// se levento viene declined in quanto dentro a una no availability
// le notifiche di urgency

const NotificationsHistory = ({ loading, setLoading, refreshKey, handleNotificationClick, showHistory }) => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiService('/notifications/history');
            if (response.success) setNotifications(response.notifications);
            else setNotifications([]);
            console.log('Notifications:', response);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            NewSwal.fire({ title: 'Error', icon: 'error', text: 'Failed to fetch notifications' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [refreshKey, showHistory]);

    return (
        <>
            <div className='mb-4 bg-white p-3 border rounded-2'>
                <h4>NOTIFICATIONS HISTORY</h4>
                <p className='px-2 fs-6 text-secondary'>* Here you can view the past notifications, such ad the creation of a group event or the declining of an event due to a no availability.</p>
            </div>
            {notifications.length > 0 ? (
                <div className='d-flex flex-column gap-3 overflow-y-scroll'>
                    {notifications.map((notif, index) => (
                        <div key={index} className='bg-white border shadow-sm p-3 rounded-2'>
                            <div className='d-flex flex-column gap-2'>
                                <p className='cursor-pointer' onClick={() => handleNotificationClick(notif)}>
                                    {notif.elementType === 'Activity' ? '📝 Activity: ' : '📅 Event: '}
                                    <strong>{notif.element ? notif.element.title : 'Unknown'}</strong>
                                </p>
                                {notif.element ? (
                                    notif.elementType === 'Activity' ? (
                                        <p className='text-secondary small-text'>Deadline: {formatDate(notif.element.deadline)}</p>
                                    ) : (
                                        <>
                                            <p className='text-secondary small-text'>Start Date: {formatDate(notif.element.startDate)}</p>
                                            <p className='text-secondary small-text'>End Date: {formatDate(notif.element.endDate)}</p>
                                        </>
                                    )
                                ) : (
                                    <p className='text-secondary small-text'>Details not available</p>
                                )}
                                <p>{notif.text}</p>
                                <div className='d-flex gap-2 mt-1'>
                                    {notif.urgency && <span className='d-flex items-center gap-1'><AlertTriangle size={16} /> Urgent</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                loading ? <LoadingPageDark /> : <p className='ps-2'>Nessuna notifica passata.</p>
            )}
        </>
    );
}

export default NotificationsHistory;