import React, { useState }  from 'react';

import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { useCalendar } from '../../contexts/CalendarContext';
import ShareInput from '../../components/ShareInput';
import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';
import NotificationInput from '../../components/Notification/NotificationInput';

const FormActivity = () => {

    const { activity, setActivity, activities, setActivities, resetActivity, selected, resetSelected, notifications, setNotifications } = useCalendar();
    const [deletePopUp, setDeletePopUp] = useState(false);

    const setDeadline = (date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59);
        setActivity({...activity, ['deadline']: newDate});
    }

    const handleSubmit = async () => {
        if (!activity.title) {
            Swal.fire({ title: 'Warning', icon: 'warning', text: 'Title is required', customClass: { confirmButton: 'button-alert' } });
            return;
        }

        if (selected.edit) {
            const response = await apiService(`/activity/${activity._id}`, 'PUT', activity);
            if (response){
                Swal.fire({ title: 'Activity edited', icon: 'success', text: 'Activity edited successfully', customClass: { confirmButton: 'button-alert' } });
                setActivities(activities.map(act => act._id === activity._id ? activity : act));
                resetActivity();
            } else Swal.fire({ title: 'Error editing activity', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });

        } else {
            const response = await apiService(`/activity`, 'POST', activity);
            if (response){
                Swal.fire({ title: 'Activity added', icon: 'success', text: 'Activity added successfully', customClass: { confirmButton: 'button-alert' } });
                setActivities([...activities, response]);
                resetActivity();
            } else Swal.fire({ title: 'Error adding activity', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });

            const newActivity = response;

            if (notifications.length > 0) {
                const response = await apiService(`/notification`, 'POST', {
                    type: 'Activity',
                    elementId: newActivity._id,
                    notifications: notifications
                });
                if (response) setNotifications([]);
                else Swal.fire({ title: 'Error adding notifications', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
            } else {
                console.log('No notifications to add');
            }
        }
        resetSelected();
    }

    const deleteActivity = async () => {
        setDeletePopUp(false);
        const response = await apiService(`/activity/${activity._id}`, 'DELETE');
        if (response){
            Swal.fire({ title: 'Activity deleted', icon: 'success', text: 'Activity deleted successfully', customClass: { confirmButton: 'button-alert' } });
            setActivities(activities.filter(act => act._id !== activity._id));
            resetActivity();
        } else Swal.fire({ title: 'Error deleting activity', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        resetSelected();
    }

    const exportActivity = async () => {
        try {
            const response = await apiService(`/activity/${activity._id}/export`, 'GET', null, {
                credentials: 'include',
            });
    
            if (!response) throw new Error('Empty response from server');
    
            const blob = response;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activity.title}.ics`;
            a.click();
    
            Swal.fire({
                title: 'Activity exported',
                icon: 'success',
                text: 'Activity exported successfully, a mail with .ics attachment will be sent to you',
                customClass: { confirmButton: 'button-alert' }
            });
        } catch (err) {
            Swal.fire({
                title: 'Error exporting activity',
                icon: 'error',
                text: err.message || 'Unknown error',
                customClass: { confirmButton: 'button-alert' }
            });
        }
    }

    return (
        <div className='d-flex flex-column w-100'>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text' className='form-control' id='title'
                        placeholder='Activity title'
                        value={activity.title}
                        onChange={(e) => setActivity({...activity, ['title']: e.target.value})} />
                </div>

                <div className='col-6'>
                    <label htmlFor='deadline' className='form-label'>Deadline</label>
                    <input type='date' className='form-control' id='deadline'
                    value={activity.deadline ? (new Date(activity.deadline)).toISOString().split('T')[0] : ''}
                    onChange={(e) => setDeadline(e.target.value)} />
                </div>
            </div>

            <div className='row d-flex justify-content-center py-2'>
                <div className='col col-auto form-check'>
                    <input className='form-check-input' type='checkbox' role='switch' id='completed'
                        value={activity.completed}
                        onChange={(e) => setActivity({...activity, ['completed']: e.target.checked})} />
                    <label className='form-check-label' htmlFor='completed'>Completed</label>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <label htmlFor='share' className='form-label'>Share with</label>
                    <ShareInput receivers={activity.sharedWith} setReceivers={(receivers) => setActivity({...activity, ['sharedWith']: receivers})} />
                </div>
            </div>

            <div className='row'>
                <div className='col-12 justify-content-center align-items-center d-flex'>
                    <NotificationInput notifications={notifications} setNotifications={setNotifications}/>
                </div>
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' className='btn-main rounded shadow-sm mt-4' onClick={() => handleSubmit()}>{selected.edit ? 'edit' : 'save'}</button>
                {selected.edit && (
                    <>
                    <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => setDeletePopUp(true)}>delete</button>
                    <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => exportActivity()}>export .ics</button>
                    </>
                    
                )}
            </div>

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