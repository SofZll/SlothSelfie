import React, { useState, useEffect} from 'react';
import './css/Notifications.css';
import Swal from 'sweetalert2'
import { calculateTime } from './globalFunctions';

const Notifications = ({ username }) => {
    const [receiverInput, setReceiverInput] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

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
                read: false
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

            setNotifs([newNotif, ...notifs]);
        }
        else if (!receivers.length) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter at least one receiver!',
                icon: 'error',
                customClass: {
                    confirmButton: 'button-alert'
                }
            });
        }
        else if (!message) {
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
                            <button className="btn notif-button" onClick={() => handleReadNotif(notif._id)}>Read</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Notifications;