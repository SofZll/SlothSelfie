import React from 'react';

import { validateNotification } from '../../utils/validation';

const NotificationRepeat = ({ notif, index, handleModifyNotification }) => {
    return (
        <>
            <div className='mb-2'>
                <label className='form-label'>Repeat every:</label>
                <select className='form-select' value={notif.variant} onChange={(e) => handleModifyNotification(index, 'variant', e.target.value)}>
                    <option value='minute'>Minute</option>
                    <option value='hour'>Hour</option>
                    <option value='day'>Day</option>
                    <option value='week'>Week</option>
                </select>
            </div>
            <div className='mb-2'>
                <label className='form-label'>From:</label>
                <div className='d-flex gap-2'>
                    <div className='row g-2'>
                        <div className='col'>
                            <input type='date' className='form-control' value={notif.fromDate} onChange={(e) => handleModifyNotification(index, 'fromDate', e.target.value)} />
                        </div>
                        <div className='col'>
                            <input type='time' className='form-control' value={notif.fromTime} onChange={(e) => handleModifyNotification(index, 'fromTime', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='mb-2'>
                {!validateNotification(notif, 2) && (
                    <div className="text-danger small mt-1">
                        Missing values
                    </div>
                )}
            </div>
        </>
    );
}

export default NotificationRepeat;