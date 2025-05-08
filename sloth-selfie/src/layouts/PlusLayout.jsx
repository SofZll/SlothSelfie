import React, { useContext } from 'react';
import { Plus, Settings } from 'lucide-react';

import { useIsDesktop } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';

const PlusLayout = ({ children, clickCall, selected, popUp, isCalendar = false }) => {
    const { calendarSettings, setCalendarSettings, user } = useContext(AuthContext);
    const isDesktop = useIsDesktop();

    return (
        <div className='d-flex flex-column w-100 h-100 justify-content-center align-items-center'>

            {!isDesktop && (
                <>
                    {isCalendar && !user.isAdmin && (
                        <button type='button' aria-label='settings' title='settings' className='btn-main rounded-circle p-2 position-fixed end-0 mx-3 btn-settings pop-up' onClick={() => setCalendarSettings(!calendarSettings)}>
                            <Settings size={36} color='#fafafa' strokeWidth={1.75} />
                        </button>
                    )}
                    
                    <button type='button' aria-label='add' title='add' className='btn-main rounded-circle p-2 position-fixed end-0 mx-3 btn-plus pop-up' onClick={() => clickCall()}>
                        <Plus size={36} color='#fafafa' strokeWidth={1.75} />
                    </button>

                    {selected && (
                        <div className='d-flex flex-column bg-white rounded p-3 position-fixed top-50 start-50 translate-middle pop-up popup-square shadow-lg'>
                            {popUp}
                        </div>
                    )}
                </>
            )}

            {children}
        </div>
    )
}

export default PlusLayout;