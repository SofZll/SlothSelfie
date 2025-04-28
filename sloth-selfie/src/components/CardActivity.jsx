import React from 'react';

import { apiService } from '../services/apiService';
import { useCalendar } from '../contexts/CalendarContext';

import { Pen } from 'lucide-react';

const CardActivity = ({ Activity, smallView }) => {

    const { setActivity, activities, setActivities, setSelected, fetchNotifications } = useCalendar();

    const markComplete = async () => {
        const response = await apiService(`/activity/${Activity._id}`, 'PUT', { ...Activity, completed: !Activity.completed });
        if (response.success) setActivities(activities.map(act => act._id === Activity._id ? { ...act, completed: !act.completed } : act));
    }

    const selectActivity = () => {
        setActivity({ ...Activity, sharedWith: Activity.sharedWith.map(user => user.username)});
        setSelected({ selection: 'activity', edit: true, add: false, popup: true });
        fetchNotifications({ elementId: Activity._id });
    }
    
    const handleResponse = async (status) => {
        const response = await apiService(`/activity/${Activity._id}`, 'PUT', { ...Activity, status });
        if (response.success) {
            setActivities(activities.map(act => act._id === Activity._id ? { ...act, response } : act));
            if (status === 'declined') setActivities(activities.filter(act => act._id !== Activity._id));
        }
        else console.error('Error updating activity response:', response);
    }

    return (
        <div className='d-flex flex-column w-100 align-items-center border rounded shadow-sm p-md-3 p-1 position-relative'>
            
            <div className='row w-100'>
                <div className='col col-6 text-break activity-title fw-bold text-center'>
                    {Activity.title}
                </div>
                <div className='col col-6 activity-title text-break activity-title fst-italic'>
                    {Activity.user.username}
                </div>
            </div>

            {!smallView && Activity.description && (
                <div className='row w-100 p-2'>
                    <div className='col col-12 text-center'>
                        {Activity.description.content.length > 100 ? Activity.description.content.slice(0, 100) + '...' : Activity.description.content}
                    </div>
                </div>
            )}

            <div className='row w-100 d-flex align-items-center'>
                {Activity.response !== 'pending' && (
                    <div className='col col-6 d-flex justify-content-center'>
                        <button type='button' className={`btn btn-outline-secondary ${Activity.completed && 'btn-active'}`} disabled={Activity.project} onClick={() => markComplete()}>
                            {Activity.completed ? 'Completed' : 'to Complete'}
                        </button>
                    </div>
                )}
                {Activity.deadline && (
                    <div className={`col ${Activity.response === 'pending' ? 'col-12 my-2' : 'col-6'} d-flex justify-content-center`}>
                        {new Date(Activity.deadline).toLocaleDateString()}
                    </div>
                )}
            </div>
            
            {Activity.response === 'pending' && (
                <div className='row w-100 d-flex align-items-center'>
                    <div className='col col-6 d-flex justify-content-center'>
                        <button type='button' className='btn btn-success' onClick={() => handleResponse('accepted')}>
                            Accept
                        </button>
                    </div>
                    <div className='col col-6 d-flex justify-content-center'>
                        <button type='button' className='btn btn-danger' onClick={() => handleResponse('declined')}>
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {!Activity.project && Activity.response !== 'pending' && (
                <button className='btn position-absolute top-0 end-0 p-0' onClick={() => selectActivity()}>
                    <Pen size={20} color='#244476' strokeWidth={1.25} />
                </button>
            )}
        </div>
    )
}

export default CardActivity;