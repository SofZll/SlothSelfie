import React, { useState } from 'react';
import { BellPlus, X, ChevronDown } from 'lucide-react';
import '../styles/NotificationInput.css';

const NotificationInput = () => {
    const [notifications, setNotifications] = useState([]);
    const [showSelectNotification, setShowSelectNotification] = useState(null);

    const handleAddNotification = () => {
        const type = 'default';
        const newNotification = {
            type,
            ...(type === 'default' ? {
                before: 1,
                beforeType: 'day',
                time: '08:00',
            } : {
                repeat: 'daily',
                from: new Date(),  
            })
        };
        if (newNotification) {
            setNotifications([...notifications, newNotification]);
        }
    }

    const handleRemoveNotification = (index) => {
        setNotifications(notifications.filter((_, i) => i !== index));
    };

    const handleModifyNotification = (index, field, value) => {
        const updatedNotifications = [...notifications];
        
        if (field === 'type') {
            updatedNotifications[index] = {
                type: value,
                ...(value === 'default' ? {
                    before: 1,
                    beforeType: 'day',
                    time: '08:00',
                    repeat: undefined,
                    from: undefined
                } : {
                    repeat: 'daily',
                    from: new Date(),
                    before: undefined,
                    beforeType: undefined,
                    time: undefined
                })
            };
        } else {
            updatedNotifications[index] = {
                ...updatedNotifications[index],
                [field]: value
            };
        }

        setNotifications(updatedNotifications);
    }

    return (
        <div className='d-flex flex-column align-items-center px-0'>
            {notifications.map((notif, index) => (
                <div className='notification-card card mb-3 p-3'>
                    <div className='d-flex justify-content-between align-items-center mb-3 position-relative'>
                        <strong>Notification {index + 1}</strong>
                        <div>
                            <button className='btn btn-sm btn-outline-secondary me-2' onClick={() => setShowSelectNotification(showSelectNotification === index ? null : index)}>
                                <ChevronDown size={16} />
                            </button>
                            <button className='btn btn-sm btn-outline-danger' onClick={() => handleRemoveNotification(index)}>
                                <X size={16} />
                            </button>
                        </div>
                        {showSelectNotification === index && (
                        <div className='notification-select position-absolute end-0 top-100 rounded shadow-sm z-2'>
                            <button onClick={() => {handleModifyNotification(index, 'type', 'default'); setShowSelectNotification(null)}} >
                                <span>default</span>
                            </button>
                            <button onClick={() => {handleModifyNotification(index, 'type', 'repeat'); setShowSelectNotification(null)}} >
                                <span>repeat</span>
                            </button>
                        </div>
                    )}
                    </div>
                    {notif.type === 'default' ? (
                        <>
                            <div className='mb-2'>
                                <label className='form-label'>Notify me:</label>
                                <div className='input-group'>
                                    <input type='number' className='form-control' min='1' max='30' value={notif.before} onChange={(e) => handleModifyNotification(index, 'before', e.target.value)} />
                                    <select className='form-select' value={notif.beforeType} onChange={(e) => handleModifyNotification(index, 'beforeType', e.target.value)}>
                                        <option value='day'>Day</option>
                                        <option value='week'>Week</option>
                                    </select>
                                    <span className='input-group-text'>before the event</span>
                                </div>
                            </div>
                            <div className='mb-2'>
                                <label className='form-label'>At:</label>
                                <input type='time' className='form-control' value={notif.time} onChange={(e) => handleModifyNotification(index, 'time', e.target.value)} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='mb-2'>
                                <label className='form-label'>Repeat every:</label>
                                <select className='form-select' value={notif.repeat} onChange={(e) => handleModifyNotification(index, 'repeat', e.target.value)}>
                                    <option value='minute'>Minute</option>
                                    <option value='hour'>Hour</option>
                                    <option value='day'>Day</option>
                                    <option value='week'>Week</option>
                                </select>
                            </div>
                            <div className='mb-2'>
                                <label className='form-label'>From:</label>
                                <div className='d-flex gap-2'>
                                    <input type='date' className='form-control' value={notif.from.toISOString().split('T')[0]} onChange={(e) => handleModifyNotification(index, 'from', new Date(`${e.target.value}T${notif.from.toTimeString().split(' ')[0]}`))} />
                                    <input type='time' className='form-control' value={notif.from.toTimeString().substr(0, 5)} onChange={(e) => handleModifyNotification(index, 'from', new Date(`${notif.from.toISOString().substr(0, 5)}T${e.target.value}`))} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ))}
            {notifications.length < 5 && (
                <div className='col-12 d-flex justify-content-center'>
                    <button className='button-clean button-transparent' onClick={handleAddNotification}>
                        <BellPlus />
                    </button>
                </div>
            )}
        </div>
    )
}

export default NotificationInput;
