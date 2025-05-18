import React, { useState, useContext } from 'react';
import { BellPlus, X, ChevronDown } from 'lucide-react';
import { NewSwal } from '../../utils/swalUtils';

import '../../styles/NotificationInput.css';
import { dateFromDate, timeFromDate } from '../../utils/utils';
import { validateNotification } from '../../utils/validation';
import NotificationDefault from './NotificationDefault';
import NotificationRepeat from './NotificationRepeat';

import { apiService } from '../../services/apiService';
import { TimeMachineContext } from '../../contexts/TimeMachineContext';

const NotificationInput = ({ notifications, setNotifications }) => {
    const { getVirtualNow } = useContext(TimeMachineContext);
    const [showSelectNotification, setShowSelectNotification] = useState(null);

    const handleAddNotification = () => {
        const virtualNow = getVirtualNow();
        const type = 'default';
        const newNotification = {
            type: type,
            mode: {
                email: false,
                system: true
            },
            before: 1,
            variant: 'day',
            ...(type === 'default' ? {
                time: '08:00',
            } : {
                fromDate: dateFromDate(virtualNow),
                fromTime: timeFromDate(virtualNow),
            })
        };
        if (newNotification) {
            setNotifications([...notifications, newNotification]);
        }
    }

    const handleRemoveNotification = async (index) => {
        if (notifications[index]._id !== undefined) {
            const result = await NewSwal.fire({
                title: 'Are you sure?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (!result.isConfirmed) return;

            const response = await apiService(`/notification/${notifications[index]._id}`, 'DELETE');
            if (response.success) NewSwal.fire('Deleted!', 'Your notification has been deleted.', 'success');
            else NewSwal.fire('Error!', 'There was an error deleting the notification.', 'error');
        }
        setNotifications(notifications.filter((_, i) => i !== index));
    };

    const handleModifyNotification = (index, field, value) => {
        const virtualNow = getVirtualNow();
        const updatedNotifications = [...notifications];
        
        if (field === 'type') {
            updatedNotifications[index] = {
                type: value,
                mode: {
                    email: false,
                    system: true
                },
                before: 1,
                variant: 'day',
                ...(value === 'default' ? {
                    time: '08:00',
                    fromDate: undefined,
                    fromTime: undefined
                } : {
                    fromDate: dateFromDate(virtualNow),
                    fromTime: timeFromDate(virtualNow),
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
                <div key={notif._id || `notif-${index}`} className='notification-card card mb-3 p-3'>
                    <div className='d-flex justify-content-between align-items-center mb-3 position-relative'>
                        <strong>Notification {index + 1}</strong>
                        <div>
                            <button type='button' aria-label='Select notification' title='Select notification' className='btn btn-sm btn-outline-secondary me-2' onClick={() => setShowSelectNotification(showSelectNotification === index ? null : index)}>
                                <ChevronDown size={16} />
                            </button>
                            <button type='button' aria-label='Remove notification' title='Remove notification' className='btn btn-sm btn-outline-danger' onClick={() => handleRemoveNotification(index)}>
                                <X size={16} />
                            </button>
                        </div>
                        {showSelectNotification === index && (
                        <div className='notification-select position-absolute end-0 top-100 rounded shadow-sm z-2'>
                            <button type='button' aria-label='Setto default type' title='Set to default type' onClick={() => {handleModifyNotification(index, 'type', 'default'); setShowSelectNotification(null)}} >
                                <span>default</span>
                            </button>
                            <button type='button' aria-label='Set to repeat type' title='Set to repeat type' onClick={() => {handleModifyNotification(index, 'type', 'repeat'); setShowSelectNotification(null)}} >
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
                        <div className='form-check'>
                            <input type='checkbox' className='form-check-input' role='switch' id='mail' checked={notif.mode.email} onChange={(e) => handleModifyNotification(index, 'email', e.target.checked)} />
                            <label className='form-check-label' htmlFor='mail'>email</label>
                        </div>
                        <div className='form-check'>
                            <input type='checkbox' className='form-check-input' role='switch' id='system' checked={notif.mode.system} onChange={(e) => handleModifyNotification(index, 'system', e.target.checked)} />
                            <label className='form-check-label' htmlFor='system'>system</label>
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
                    <button type='button' aria-label='Add new notification' title='Add new notification' className='button-clean button-transparent' onClick={handleAddNotification}>
                        <BellPlus />
                    </button>
                </div>
            )}
        </div>
    )
}

export default NotificationInput;
