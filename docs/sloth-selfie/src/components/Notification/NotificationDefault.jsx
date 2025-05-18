import React from 'react';

import { validateNotification } from '../../utils/validation';

const NotificationDefault = ({ notif, index, handleModifyNotification }) => {
    return (
        <>
            <div className='mb-2'>
                <label className='form-label'>Notify me:</label>
                <div className='input-group'>
                    <input type='number' className='form-control' min='1' max='30' value={notif.before} onChange={(e) => handleModifyNotification(index, 'before', e.target.value)} />
                    <select className='form-select' value={notif.variant} onChange={(e) => handleModifyNotification(index, 'variant', e.target.value)}>
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
            <div className='mb-2'>
                {!validateNotification(notif, 1) && (
                    <div className="text-danger small mt-1">
                        Missing values
                    </div>
                )}
            </div>
        </>
    );
}

export default NotificationDefault;