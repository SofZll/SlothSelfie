import React, { useEffect }  from 'react';

import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { useActivity } from '../../contexts/ActivityContext';

const FormActivity = (props) => {

    const { activity, setActivity, activities, setActivities, resetActivity } = useActivity();

    const handleSubmit = async () => {
        if (props.edit) {
            const response = await apiService('/activity/edit', 'POST', activity);
            if (response){
                Swal.fire({ title: 'Activity edited', icon: 'success', text: 'Activity edited successfully', customClass: { confirmButton: 'button-alert' } });
                setActivities(activities.map(act => act._id === activity._id ? activity : act));
                resetActivity();
            } else Swal.fire({ title: 'Error editing activity', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });

        } else {
            const response = await apiService('/activity/add', 'PUT', activity);
            if (response){
                Swal.fire({ title: 'Activity added', icon: 'success', text: 'Activity added successfully', customClass: { confirmButton: 'button-alert' } });
                setActivities([...activities, response]);
                resetActivity();
            } else Swal.fire({ title: 'Error adding activity', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        }
    }

    useEffect(() => {
        if (props.edit) {
            setActivity(activity);
        }
    }, [props.edit]); 


    return (
        <form className='d-flex flex-column w-100' onSubmit={() => handleSubmit()}>
            <div className='row py-2'>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input
                        type='text' className='form-control' id='title'
                        placeholder='Activity title'
                        value={activity.title}
                        onChange={(e) => setActivity({...activity, ['title']: e.target.value})}
                        required />
                </div>

                <div className='col-6'>
                    <label htmlFor='deadline' className='form-label'>Deadline</label>
                    <input type='Date' className='form-control' id='deadline'
                    placeholder={new Date()} 
                    value={activity.deadline}
                    onChange={(e) => setActivity({...activity, ['deadline']: e.target.value})} />
                </div>
            </div>

            <div className='row d-flex justify-content-center py-2'>
                <div className='col col-auto form-check'>
                    <input className='form-check-input' type='checkbox' role='switch' id='done'
                    value={activity.done}
                    onChange={(e) => setActivity({...activity, ['done']: e.target.checked})} />
                    <label className='form-check-label' htmlFor='done'>Compleded</label>
                </div>
            </div>
            

            <div className='row py-2'>
                <div className='col-6'>
                    {/* Field for notification TODO */}
                </div>
                <div className='col-6'>
                    {/* Field for share TODO */}
                </div>
            </div>

            <button type='submit' className='btn-main rounded shadow-sm mt-4'>{props.edit ? 'edit' : 'save'}</button>
        </form>
    )
}

export default FormActivity;