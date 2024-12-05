import React, { useState, useEffect} from 'react';
import './css/Notifications.css';
import Swal from 'sweetalert2'
import { calculateTime } from './globalFunctions';
import socket from './socket';

const NotificationFunction = () => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [receiverInput, setReceiverInput] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchNotifications(), fetchUsername()]);
            setLoading(false);
        };
        
        fetchData();

        socket.on('notification', (newNotif) => {
            console.log('New notification received:', newNotif);

            Swal.fire({
                title: `${newNotif.sender.username}`,
                text: `${newNotif.message}`,
                icon: 'info',
                customClass: {
                    confirmButton: 'button-alert'
                },
                timer: 5000,
                timerProgressBar: true,
                toast: true, // Show as a toast popup
                position: 'top-end' // Position on top-right
            });
        });

        return () => {
            socket.off('notification');
        };
    }, []);

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
                console.log('Fetched notifications:', data.notifications); // Debugging log
                setNotifs(data.notifications);
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

    const handleAddReceiver = () => {
        if (receiverInput) {
            setReceivers([...receivers, receiverInput]);
            setReceiverInput('');
        }
    }

    const handleRemoveReceiver = (index) => {
        setReceivers(receivers.filter((_, i) => i !== index));
    }

    const handleSend = async () => {
        const message = document.querySelector('.text-notif textarea').value;
        
        if (receivers.length && message) {
            const date = new Date().toISOString().split('T')[0];
            const time = new Date().toISOString().split('T')[1].split('.')[0];
            const newNotif = {
                receivers,
                message,
                date,
                time,
                read: receivers.map(() => false),
            };
            
            const response = await fetch('http://localhost:8000/api/notification/new-notif', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newNotif)
            });
            
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
                setReceivers([]);
                document.querySelector('.text-notif textarea').value = '';
                fetchNotifications();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Error sending notification!',
                    icon: 'error',
                    customClass: {
                        confirmButton: 'button-alert'
                    }
                });
                return;
            }
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
                        <div className="add-receiver">
                            <input type="text" placeholder="Enter receiver's username" value={receiverInput} onChange={(e) => setReceiverInput(e.target.value)}/>
                            <button className="btn new-notif-button" onClick={handleAddReceiver}>Add</button>
                        </div>
                        <div className="receivers-list">
                            {receivers.map((receiver, index) => (
                                <div key={index} className="receiver-tag">
                                    {receiver}
                                    <button className="remove-receiver-button" onClick={() => handleRemoveReceiver(index)}>&times;</button>
                                </div>
                            ))}
                        </div>
                        <div className="text-notif">
                            <textarea placeholder="Write here..." />
                            <button className="btn new-notif-button" onClick={handleSend}>Send</button>
                        </div>
                    </div>
                    {/* TODO: Add a button to mark all notifications as read*/}
                    {/* TODO: Change colors if the notification is related to an event or an activity */}
                    <div className="notif-list">
                        {notifs.map((notif) => {
                            const receiverIndex = notif.receivers.findIndex(r => r.username === username);
                            return !notif.read[receiverIndex] && (
                                <div key={notif._id} id={`notif-${notif._id}`} className={`notif ${notif.read[receiverIndex] ? 'read' : 'unread'}`}>
                                    <div className="notif-title">
                                        <h6>{notif.sender.username}</h6>
                                        <p>{calculateTime(notif.time, notif.date)}</p>
                                    </div>
                                    <p>{notif.message}</p>
                                    {notif.activity && (
                                        <>
                                            <p>Activity: {notif.activity.title}</p>
                                            <p>Deadline: {notif.activity.deadline}</p>
                                        </>
                                    )}
                                    {notif.event && (
                                        <>
                                            <p>Event: {notif.event.title}</p>
                                            <p>Date: {notif.event.date}</p>
                                        </>
                                    )}
                                    {!(notif.event || notif.activity) ? (
                                        <button className="btn notif-button" onClick={() => handleReadNotif(notif._id)}>Read</button>
                                    ):(
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