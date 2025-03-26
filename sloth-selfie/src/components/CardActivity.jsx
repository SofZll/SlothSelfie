import React from 'react';

import { apiService } from '../services/apiService';
import { useCalendar } from '../contexts/CalendarContext';

import { Pen } from 'lucide-react';

const CardActivity = ({ Activity, smallView }) => {

    const { setActivity, activities, setActivities, setSelected } = useCalendar();

    const markComplete = async () => {
        const response = await apiService(`/activity/${Activity._id}`, 'PUT', { ...Activity, completed: !Activity.completed });
        if (response) setActivities(activities.map(act => act._id === Activity._id ? { ...act, completed: !act.completed } : act));
    }

    const selectActivity = () => {
        setActivity(Activity);
        setSelected({ selection: 'activity', edit: true });
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
                <div className='col col-6 d-flex justify-content-center'>
                    <button type='button' className={`btn btn-outline-secondary ${Activity.completed && 'btn-active'}`} onClick={() => markComplete()}>
                        {Activity.completed ? 'Completed' : 'to Complete'}
                    </button>
                </div>
                {Activity.deadline && (
                    <div className='col col-6'>
                        {new Date(Activity.deadline).toLocaleDateString()}
                    </div>
                )}
            </div>
            
            <button className='btn position-absolute top-0 end-0 p-0' onClick={() => selectActivity()}>
                <Pen size={20} color='#244476' strokeWidth={1.25} />
            </button>
        </div>
    )
}

export default CardActivity;