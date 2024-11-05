import React, { useState } from 'react';
import './css/Notifications.css';
import Swal from 'sweetalert2'

const Notifications = ({ username }) => {
    const [receiverInput, setReceiverInput] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [notifs, setNotifs] = useState([
        {
            sender: 'John Doe',
            receivers: [],
            message: 'You have a new follower!',
            dateTime: '2023-10-01T14:30:00Z',
            read: false
        },
        {
            sender: 'Jane Doe',
            receivers: [],
            message: 'Your post received a new like!',
            dateTime: '2023-10-02T09:15:00Z', // Aggiunto orario
            read: true
        },
        {
            sender: 'John Doe',
            receivers: [],
            message: 'You have a new comment on your post!',
            dateTime: '2023-10-03T16:45:00Z', // Modificato in dateTime e aggiunto orario
            read: false
        },
        {
            sender: 'John Doe',
            receivers: [],
            message: 'Your profile was viewed 10 times today!',
            dateTime: '2023-10-04T11:20:00Z', // Modificato in dateTime e aggiunto orario
            read: true
        },
        {
            sender: 'John Doe',
            receivers: [],
            message: 'You have a new message!',
            dateTime: '2023-10-05T08:55:00Z', // Modificato in dateTime e aggiunto orario
            read: false
        }
    ]);

    const handleReadNotif = (notifId) => {
        const notifElement = document.getElementById(`notif-${notifId}`);
        notifElement.classList.add('disappearing');
        setTimeout(() => {
            setNotifs(notifs.map(notif => 
                notif.id === notifId ? { ...notif, read: true } : notif
            ));
        }, 500);
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

    const handleSend = () => {
        const message = document.querySelector('.text-notif textarea').value;
        
        if (receivers.length && message) {
            const date = new Date();
            const sender = username;
            const newNotif = {
                sender,
                receivers,
                message,
                date,
                read: false
            };
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
                {notifs.map((notif) => (
                    !notif.read && (
                        <div key={notif.id} id={`notif-${notif.id}`} className={`notif ${notif.read ? 'read' : 'unread'}`}>
                            <div className="notif-title">
                                <h6>{notif.sender}</h6>
                                <p>{notif.date}</p>
                            </div>
                            <p>{notif.message}</p>
                            <button className="btn notif-button" onClick={() => handleReadNotif(notif.id)}>Read</button>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default Notifications;