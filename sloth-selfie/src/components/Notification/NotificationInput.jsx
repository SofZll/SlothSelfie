import React, { useState } from 'react';
import { BellPlus, X, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

import '../../styles/NotificationInput.css';
import { dateFromDate, timeFromDate } from '../../utils/utils';
import { validateNotification } from '../../utils/validation';
import NotificationDefault from './NotificationDefault';
import NotificationRepeat from './NotificationRepeat';

import { apiService } from '../../services/apiService';

const NotificationInput = ({ notifications, setNotifications }) => {
    const [showSelectNotification, setShowSelectNotification] = useState(null);

    const handleAddNotification = () => {
        const type = 'default';
        const newNotification = {
            type: type,
            mode: {
                email: false,
                system: true
            },
            variant: 'day',
            ...(type === 'default' ? {
                before: 1,
                time: '08:00',
            } : {
                fromDate: dateFromDate(new Date()),
                fromTime: timeFromDate(new Date()),
            })
        };
        if (newNotification) {
            setNotifications([...notifications, newNotification]);
        }
    }

    const handleRemoveNotification = (index) => {
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const response = apiService(`/notification/${notifications[index]._id}`, 'DELETE');
                if (response) Swal.fire('Deleted!', 'Your notification has been deleted.', 'success');
                else Swal.fire('Error!', 'There was an error deleting the notification.', 'error');
                setNotifications(notifications.filter((_, i) => i !== index));
            }
        });
    };

    const handleModifyNotification = (index, field, value) => {
        const updatedNotifications = [...notifications];
        
        if (field === 'type') {
            updatedNotifications[index] = {
                type: value,
                mode: {
                    email: false,
                    system: true
                },
                variant: 'day',
                ...(value === 'default' ? {
                    before: 1,
                    time: '08:00',
                    from: undefined
                } : {
                    fromDate: dateFromDate(new Date()),
                    fromTime: timeFromDate(new Date()),
                    before: undefined,
                    time: undefined
                })
            };
        } else if (field === 'email' || field === 'system') {
            updatedNotifications[index] = {
                ...updatedNotifications[index],
                mode: {
                    ...updatedNotifications[index].mode,
                    [field]: value
                }
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
                        <NotificationDefault notif={notif} index={index} handleModifyNotification={handleModifyNotification} />
                    ) : (
                        <NotificationRepeat notif={notif} index={index} handleModifyNotification={handleModifyNotification}/>
                    )}
                    <div className='mb-2 d-flex flex-row justify-content-around pt-2'>
                        <div class='form-check'>
                            <input type='checkbox' className='form-check-input' role='switch' id='mail' checked={notif.mode.email} onChange={(e) => handleModifyNotification(index, 'email', e.target.checked)} />
                            <label className='form-check-label' for='mail'>email</label>
                        </div>
                        <div class='form-check'>
                            <input type='checkbox' className='form-check-input' role='switch' id='system' checked={notif.mode.system} onChange={(e) => handleModifyNotification(index, 'system', e.target.checked)} />
                            <label className='form-check-label' for='system'>system</label>
                        </div>
                    </div>
                    <div className='mb-2'>
                        {!validateNotification(notif, 3) && (
                            <div className="text-danger small mt-1">
                                Select al least one notification mode
                            </div>
                        )}
                    </div>
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
