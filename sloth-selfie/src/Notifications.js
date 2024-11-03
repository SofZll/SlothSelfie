import React, { useState } from 'react';
import './css/Notifications.css';

const Notifications = () => {
    const [receiverInput, setReceiverInput] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [notifs, setNotifs] = useState([
        {
            id: 1,
            sender: 'John Doe',
            message: 'You have a new follower!',
            date: '2023-10-01',
            read: false
        },
        {
            id: 2,
            sender: 'Jane Doe',
            message: 'Your post received a new like!',
            date: '2023-10-02',
            read: true
        },
        {
            id: 3,
            sender: 'John Doe',
            message: 'You have a new comment on your post!',
            date: '2023-10-03',
            read: false
        },
        {
            id: 4,
            sender: 'John Doe',
            message: 'Your profile was viewed 10 times today!',
            date: '2023-10-04',
            read: true
        },
        {
            id: 5,
            sender: 'John Doe',
            message: 'You have a new message!',
            date: '2023-10-05',
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
        // Send notification
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