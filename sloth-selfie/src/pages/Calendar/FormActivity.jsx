import React, { useState, useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';

import { apiService } from '../../services/apiService';
import { useCalendar } from '../../contexts/CalendarContext';
import ShareInput from '../../components/ShareInput';
import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';
import NotificationInput from '../../components/Notification/NotificationInput';

const FormActivity = () => {

    const { activity, setActivity, activities, setActivities, resetActivity, selected, resetSelected, notifications, setNotifications, conditionsMet, setConditionsMet } = useCalendar();
    const [deletePopUp, setDeletePopUp] = useState(false);

    const setDeadline = (date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59);
        setActivity({...activity, deadline: newDate});
    }

    const handleSubmit = async () => {
        if (selected.edit) {
            console.log('Editing activity', activity);
            const response = await apiService(`/activity/${activity._id}`, 'PUT', { activity, notifications });
            if (response.success){
                const notificationPromises = notifications.map(async notification =>{
                    if (notification._id) {
                        const response = await apiService(`/notification/${notification._id}`, 'PUT', notification);
                        if (response.success) return response.notification;
                        else NewNewSwal.fireire({ title: 'Error editing notification', icon: 'error', text: response.message});
                    } else {
                        const response = await apiService(`/notification`, 'POST', {
                            type: 'Activity',
                            elementId: activity._id,
                            notifications: [notification]
                        });
                        if (response.success) return response.notification;
                        else {
                            console.log('Error adding notification', response.message);
                            NewNewSwal.fireire({ title: 'Error adding notification', icon: 'error', text: response.message});
                        }
                    }
                });

                await Promise.all(notificationPromises);

                NewNewSwal.fireire({ title: 'Activity edited', icon: 'success', text: 'Activity edited successfully'});
                console.log('Activity edited', activity);
                setActivities(activities.map(act => act._id === activity._id ? activity : act));
                resetActivity();
                setNotifications([]);
            } else NewNewSwal.fireire({ title: 'Error editing activity', icon: 'error', text: response.message});
        } else {
            const response = await apiService(`/activity`, 'POST', activity);
            if (response.success){
                NewNewSwal.fireire({ title: 'Activity added', icon: 'success', text: 'Activity added successfully'});
                setActivities([...activities, response.activity]);
                resetActivity();
            } else NewNewSwal.fireire({ title: 'Error adding activity', icon: 'error', text: response.message});

            const newActivity = response.activity;

            if (notifications.length > 0) {
                const response = await apiService(`/notification`, 'POST', {
                    type: 'Activity',
                    elementId: newActivity._id,
                    notifications: notifications
                });
                if (response.success) setNotifications([]);
                else NewNewSwal.fireire({ title: 'Error adding notifications', icon: 'error', text: response.message});
            } else {
                console.log('No notifications to add');
            }
        }
        resetSelected();
    }

    const handleResponse = async (status) => {
        const response = await apiService(`/activity/${activity._id}`, 'PUT', { ...activity, status });
        if (response.success) {
            setActivities(activities.map(act => act._id === activity._id ? { ...act, response } : act));
            if (status === 'declined') setActivities(activities.filter(act => act._id !== activity._id));
        }
        else console.error('Error updating activity response:', response);
    }

    const deleteActivity = async () => {
        setDeletePopUp(false);
        const response = await apiService(`/activity/${activity._id}`, 'DELETE');
        if (response.success) {
            NewNewSwal.fireire({ title: 'Activity deleted', icon: 'success', text: 'Activity deleted successfully'});
            setActivities(activities.filter(act => act._id !== activity._id));
            resetActivity();
        } else NewNewSwal.fireire({ title: 'Error deleting activity', icon: 'error', text: response.message});
        resetSelected();

        notifications.forEach(notification => {
            apiService(`/notification/${notification._id}`, 'DELETE');
            setNotifications([]);
        });
    }

    useEffect(() => {
        if (activity.title) setConditionsMet(true);
        else setConditionsMet(false);
    }, [activity.title]);

    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden' style={{ maxHeight: '70vh' }}>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text' className='form-control' id='title'
                        placeholder='Activity title'
                        value={activity.title}
                        disabled={activity.project || activity.response === 'pending'}
                        onChange={(e) => setActivity({...activity, title: e.target.value})} />
                </div>

                <div className='col-6'>
                    <label htmlFor='deadline' className='form-label'>Deadline</label>
                    <input type='date' className='form-control' id='deadline'
                    disabled={activity.project || activity.response === 'pending'}
                    value={activity.deadline ? (new Date(activity.deadline)).toLocaleDateString('en-CA') : ''}
                    onChange={(e) => setDeadline(e.target.value)} />
                </div>
            </div>

            <div className='row d-flex justify-content-center py-2'>
                <div className='col col-auto form-check'>
                    <input className='form-check-input' type='checkbox' role='switch' id='completed'
                        value={activity.completed}
                        disabled={activity.project || activity.response === 'pending'}
                        onChange={(e) => setActivity({...activity, completed: e.target.checked})} />
                    <label className='form-check-label' htmlFor='completed'>Completed</label>
                </div>
            </div>

            {activity.response !== 'pending' && !activity.project && (
                <div>
                    <div className='row'>
                        <div className='col-12'>
                            <label htmlFor='share' className='form-label'>Share with</label>
                            <ShareInput receivers={activity.sharedWith} setReceivers={(receivers) => setActivity({...activity, sharedWith: receivers})} />
                        </div>
                    </div>

                    <div className='row'>
                        <div className='col-12 justify-content-center align-items-center d-flex'>
                            <NotificationInput notifications={notifications} setNotifications={setNotifications} />
                        </div>
                    </div>
                </div>
            )}

            {activity.response === 'pending' ? (
                <div className='d-flex align-items-center justify-content-center'>
                    <button type='button' className='btn btn-success' onClick={() => handleResponse('accepted')}>
                        Accept
                    </button>
                    <button type='button' className='btn btn-danger' onClick={() => handleResponse('declined')}>
                        Decline
                    </button>
                </div>
            ) : (
                <div className='d-flex align-items-center justify-content-center'>
                    {!activity.project && (
                        <button type='button' className='btn-main rounded shadow-sm mt-4' disabled={!conditionsMet} onClick={() => handleSubmit()} >
                            {selected.edit ? 'edit' : 'save'}
                        </button>
                    )}

                    {selected.edit && !activity.project && (
                        <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => setDeletePopUp(true)}>
                            delete
                        </button>
                    )}
                </div>
            )}

            {deletePopUp && (
                <DeletePopUpLayout handleDelete={() => deleteActivity()} handleClose={() => setDeletePopUp(false)}>
                    <div className='d-flex flex-column text-start'>
                        Are you sure you want to delete this activity?
                    </div>
                    <div className='d-flex flex-column'>
                        <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{activity.title}</div>
                        <div className='d-flex w-100 justify-content-between'>
                            {activity.deadline && (
                                <div className='fst-italic' style={{ color: '#244476' }}>{new Date(activity.deadline).toLocaleDateString()}</div>
                            )}
                            <div className='fw-medium' style={{ color: '#244476' }}>{activity.completed ? 'Completed' : 'to complte'}</div>
                        </div>
                    </div>
                </DeletePopUpLayout>
            )}
            

        </div>
    )
}

export default FormActivity;