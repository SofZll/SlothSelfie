import React from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';
import EditPomodoro from './EditPomodoro';
import PopUpShare from './PopUpShare';

const PopUpPomodoro = () => {

    const { popUp, resetPopUp } = usePomodoro();

    return (
        <div className='d-flex justify-content-center align-items-center position-fixed pop-up'>
            <div className='modal-dialog custom-modal'>
                <div className='modal-content border border-secondary'>

                    <div className='modal-header'>
                        {popUp.edit && <h5 className='modal-title' style={{ color: '#244476' }}>Edit your Pomodoro</h5>}

                        {popUp.share && <h5 className='modal-title' style={{ color: '#244476' }}>Share your Pomodoro</h5>}

                        {popUp.calendar && <h5 className='modal-title' style={{ color: '#244476' }}>Plan your Pomodoro</h5>}

                        <button type='button' className='close' onClick={() => resetPopUp()}>
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className='modal-body col-12'>
                        <div className='border-top border-secondary d-flex w-100 mt-3'></div>

                        {popUp.edit && (  
                            <EditPomodoro />
                        )}      
                        
                        {popUp.share && (
                            <PopUpShare />
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopUpPomodoro;