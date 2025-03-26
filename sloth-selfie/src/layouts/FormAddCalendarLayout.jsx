import React  from 'react';
import ShareInput from './ShareInput';
import { changeReceivers } from './globalFunctions';


const FormAddCalendarLayout = ({ selection, children, data, setData }) => {
    return (
        <form className='d-flex flex-column w-100 h-100'>
            <div className='row'>
                <div className='col-6'>
                    <label htmlFor='title' className='form-label'>Title</label>
                    <input type='text' className='form-control' id='title' placeholder={`${selection} title`} value={data.title} onChange={(e) => setData('title', e.target.value)}/>
                </div>
                <div className='col-6'>
                    <label htmlFor='deadline' className='form-label'>{selection === 'activity' ? 'Deadline' : 'Date'}</label>
                    <input type='Date' className='form-control' id='deadline' placeholder={new Date()} />
                </div>
            </div>

            <main className='d-flex w-100 justify-content-center'>{children}</main>

            <div className='row'>
                <div className='col-6'>
                    
                </div>
                <div className='col-6'>
                    <input className='form-check-input' type='checkbox' role='switch' id='notify' />
                    <label className='form-check-label' htmlFor='notify'>Notify</label>
                </div>
            </div>
        </form>
    )
}

export default FormAddCalendarLayout;