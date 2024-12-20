import React, { useState, useEffect} from 'react';
import './css/Notifications.css';
import Swal from 'sweetalert2'
import { calculateTime, sortElements, changeReceivers, resetReceivers} from './globalFunctions';
import ShareInput from './ShareInput';
import socket from './socket';

const NotificationFunction = () => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [triggerResetReceivers, setTriggerResetReceivers] = useState(0);
    const [notifs, setNotifs] = useState([]);
    const [hasRead, setHasRead] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchNotifications(), fetchUsername()]);
            setLoading(false);
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        checkHasRead();
    }, [notifs]);

    const fetchUsername = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/user/username', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched username:', data.username);
                setUsername(data.username);
            }
        } catch (error) {
            console.error('Error fetching username');
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/notification/get-notifications', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched notifications:', data.notifications);
                const sortedNotifs = sortElements(data.notifications, 'mostRecent');
                setNotifs(sortedNotifs);
                checkHasRead();
            } else {
                console.log('Error fetching notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications');
        }
    };

    //TODO: Merge the two functions into one
    const handleReadNotif = async (notifId) => {
        const notifElement = document.getElementById(`notif-${notifId}`);
        notifElement.classList.add('disappearing');

        try {
            const response = await fetch(`http://localhost:8000/api/notification/read-notif/${notifId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setTimeout(() => {
                    setNotifs(notifs.map(notif => {
                        if (notif._id === notifId) {
                            const receiverIndex = notif.receivers.findIndex(r => r.username === username);
                            notif.read[receiverIndex] = true;
                        }
                        return notif;
                 }));
                }, 500);
            } else {
                console.log('Error reading notification');
            }

            checkHasRead();
        } catch (error) {
            console.error('Error reading notification');
        }
    };

    const handleStatusNotif = async (notifId, status) => {
        const notifElement = document.getElementById(`notif-${notifId}`);
        notifElement.classList.add('disappearing');

        try {
            const response = await fetch(`http://localhost:8000/api/notification/status-notif/${notifId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                setTimeout(() => {
                    setNotifs(notifs.filter(notif => notif._id !== notifId));
                }, 500);
            } else {
                console.log('Error updating notification status');
            }
        } catch (error) {
            console.error('Error updating notification status');
        }
    };

    const handleCloseAll = async () => {
        const notifElements = document.querySelectorAll('.notif');
        notifElements.forEach(notifElement => {
            notifElement.classList.add('disappearing');
        });

        try {
            const response = await fetch('http://localhost:8000/api/notification/close-all', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setTimeout(() => {
                    setNotifs(notifs.map(notif => {
                        const receiverIndex = notif.receivers.findIndex(r => r.username === username);
                        if (receiverIndex !== -1) {
                            notif.read[receiverIndex] = true;
                        }
                        return notif;
                    }));
                }, 500);
            } else {
                console.log('Error closing all notifications');
            }

            checkHasRead();
        } catch (error) {
            console.error('Error closing all notifications');
        }
    };

    const handleSend = async () => {
        const message = document.querySelector('.text-notif textarea').value;
        
        if (receivers.length && message) {
            const newNotif = {
                activityId: null,
                eventId: null,
                receivers,
                message,
            };

            console.log('New notification:', newNotif);
            console.log('New notification:', JSON.stringify(newNotif));
            
            const response = await fetch('http://localhost:8000/api/notification/new-notif', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newNotif)
            });

            const data = await response.json();
            
            if (response.ok) {
                Swal.fire({
                    title: 'Success',
                    text: 'Notification sent!',
                    icon: 'success',
                    customClass: {
                        confirmButton: 'button-alert'
                    }
                });

                socket.emit('send-notification', newNotif);
                resetReceivers(setReceivers, setTriggerResetReceivers);
                document.querySelector('.text-notif textarea').value = '';
                fetchNotifications();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error',
                    customClass: {
                        confirmButton: 'button-alert'
                    }
                });
                return;
            }
            checkHasRead();
        } else if (!receivers.length) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter at least one receiver!',
                icon: 'error',
                customClass: {
                    confirmButton: 'button-alert'
                }
            });
        } else if (!message) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter a message!',
                icon: 'error',
                customClass: {
                    confirmButton: 'button-alert'
                }
            });
        }
    };

    const checkHasRead = () => {
        if (notifs.length > 0) {
            const unreadNotifs = notifs.filter(notif => {
                const receiverIndex = notif.receivers.findIndex(r => r.username === username);
                return !notif.read[receiverIndex];
            });

            if (unreadNotifs.length > 0) {
                setHasRead(false);
            } else {
                setHasRead(true);
            }
        } else {
            setHasRead(true);
        }
    }

    return (
        <>
            {loading ? (
                <div className="loading-page loading-page-dark">
                    <div className="spinner"></div>
                    <p>Loading, please wait...</p>
                </div>
            ) : (
                <div className="notifs">
                    <h5>Notifications</h5>
                    <div className="new-notif">
                        <ShareInput changeReceivers={changeReceivers({ setReceivers })} resetReceivers={triggerResetReceivers} />
                        <div className="text-notif">
                            <textarea placeholder="Write here..." />
                            <button className="btn btn-main new-notif-button" onClick={handleSend}>Send</button>
                        </div>
                    </div>
                    {/* TODO: Change colors if the notification is related to an event or an activity */}
                    <div className="notif-list">
                        {!hasRead && (
                            <div className="notif-close-all">
                                <button className="btn btn-close-all" onClick={() => handleCloseAll()}>close all</button>
                            </div>
                        )}
                        {notifs.map((notif) => {
                            const receiverIndex = notif.receivers.findIndex(r => r.username === username);
                            return !notif.read[receiverIndex] && (
                                <div key={notif._id} id={`notif-${notif._id}`} className={`notif ${notif.read[receiverIndex] ? 'read' : 'unread'}`}>
                                    <div className="notif-title">
                                        <h6>{notif.sender.username}</h6>
                                        <p>{calculateTime(notif.createdAt)}</p>
                                        <span className="close-notif" onClick={() => handleReadNotif(notif._id)}>&times;</span>
                                    </div>
                                    <p>{notif.message}</p>
                                    {(notif.event || notif.activity) && (
                                        <>
                                            <button className="btn notif-button" onClick={() => handleStatusNotif(notif._id, 'accepted')}>Accept</button>
                                            <button className="btn notif-button" onClick={() => handleStatusNotif(notif._id, 'declined')}>Decline</button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}

export default NotificationFunction;