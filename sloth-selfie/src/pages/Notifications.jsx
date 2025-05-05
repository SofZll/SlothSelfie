import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { NewSwal } from '../utils/swalUtils';

import '../styles/Notifications.css';
import MainLayout from '../layouts/MainLayout';
import { apiService } from '../services/apiService';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        const response = await apiService('/notifications/upcoming');
        if (response.success) {
            setNotifications(response.notifications.map(notification => {
                return {
                    ...notification,
                    triggerAt: new Date(notification.triggerAt).toISOString(),
                }
            }));
        } else setNotifications([]);
        console.log('Notifications:', response);
    }

    const HandleSnoozeNotif = (index) => async () => {
        const snoozeTime = new Date(notifications[index].triggerAt);
        const snoozeInterval = 10;
        snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeInterval);
        
        const response = await apiService(`/notification/snooze/${notifications[index]._id}`, 'PUT', { snoozeInterval });
        if (response.success) {
            setNotifications(notifications.map((notif, i) => i === index ? { ...notif, triggerAt: snoozeTime.toISOString() } : notif));
            window.location.reload();
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message});
    }

    // TODO: spostare in utils
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('it-IT');

    useEffect(() => {
        fetchNotifications();
    }, []);
    
    return (
        <MainLayout>
            <div className="p-2 notifications-container h-75 d-flex flex-column">
                <div className="mb-4 bg-white p-3 border rounded-2">
                    <h2>Notifications</h2>
                    <p className='px-2 fs-6 text-secondary'>* Here you can view the upcoming notifications and snooze them, to modify or to delete them you have to go to the activity or event page.</p>
                </div>
                {notifications.length > 0 ? (
                    <div className="d-flex flex-column gap-3 overflow-y-scroll">
                        {notifications.map((notif, index) => (
                            <div key={index} className="bg-white border shadow-sm p-3 rounded-2">
                                <div className='d-flex flex-column gap-2'>
                                    <p>
                                        {notif.elementType === 'Activity' ? '📝 Activity: ' : '📅 Event: '}
                                        <strong onClick={() => navigate('/d')}>{notif.element.title}</strong>
                                    </p>
                                    {notif.type === 'repeat' && <p className='text-secondary'>Type: {notif.type} every {notif.before} {notif.variant}</p>}
                                    {notif.type === 'default' && <p className='text-secondary'>Type: {notif.before} {notif.variant} before</p>}
                                    <p className='text-secondary'>{notif.elementType === 'Activity' ? 'Deadline: ' : 'Date: '}{formatDate(notif.to)}</p>
                                    <p>Next notification at: {formatDate(notif.triggerAt)}</p>
                                    <div className="d-flex gap-2 mt-1">
                                        {notif.urgency && <span className="d-flex items-center gap-1"><AlertTriangle size={16} /> Urgente</span>}
                                        {/* permettere all'utente di selezionare il tempo di snooze */}
                                        <button className='btn btn-outline-success' onClick={HandleSnoozeNotif(index)}>Postpone 10 minutes</button>
                                        {notif.type === 'repeat' && <button className='btn btn-outline-warning'>Skip this one</button>}
                                    </div>
                                </div>
                                {/*
                                <div className="d-flex mt-4 gap-3">
                                    {notif.mode.system && <Monitor size={20} title="Notifica di sistema" />}
                                    {notif.mode.email && <Mail size={20} title="Email" />}
                                </div>
                                */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='ps-2'>Nessuna notifica pianificata.</p>
                )}
            </div>
        </MainLayout>
    )
}

export default Notifications;