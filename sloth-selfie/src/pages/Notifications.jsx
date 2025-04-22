import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Monitor, Mail } from 'lucide-react';

import '../styles/Notifications.css';
import MainLayout from '../layouts/MainLayout';
import { apiService } from '../services/apiService';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        const response = await apiService('/notifications/upcoming');
        if (response) {
            setNotifications(response.notifications.map(notification => {
                return {
                    ...notification,
                    triggerAt: new Date(notification.triggerAt).toISOString(),
                    elementType: notification.elementType,
                    mode: {
                        system: notification.mode.system,
                        email: notification.mode.email
                    },
                    urgency: notification.urgency,
                    snooze: notification.snooze
                }
            }));
        } else {
            setNotifications([]);
        }
        console.log('Notifications:', response);
    }

    // TODO: spostare in utils
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('it-IT');

    useEffect(() => {
        fetchNotifications();
    }, []);
    
    return (
        <MainLayout>
            <div className="p-6 mx-auto">
                <h2 className="mb-4 background-light p-3">Upcoming Notifications</h2>

                {notifications.length > 0 ? (
                    <>
                        {notifications.map((notif, idx) => (
                            <li key={idx} className="bg-white shadow-md rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <p className="text-lg font-medium text-gray-800">
                                        {notif.elementType === 'Activity' ? '📝 Attività' : '📅 Evento'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Trigger: <strong>{formatDate(notif.triggerAt)}</strong>
                                    </p>
                                    <div className="flex gap-2 mt-2 text-sm">
                                        {notif.urgency && <span className="text-red-600 flex items-center gap-1"><AlertTriangle size={16} /> Urgente</span>}
                                        {notif.snooze && <span className="text-yellow-600 flex items-center gap-1"><Clock size={16} /> Snooze attivo</span>}
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4 sm:mt-0">
                                    {notif.mode.system && <Monitor size={20} className="text-blue-600" title="Notifica di sistema" />}
                                    {notif.mode.email && <Mail size={20} className="text-green-600" title="Email" />}
                                </div>
                            </li>
                        ))}
                    </>
                ) : (
                    <p className="text-gray-500">Nessuna notifica pianificata.</p>
                )}
            </div>
        </MainLayout>
    )
}

export default Notifications;