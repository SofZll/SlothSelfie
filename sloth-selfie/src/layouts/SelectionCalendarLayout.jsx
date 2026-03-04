import React, { useEffect, useContext } from 'react';
import { X, MoveLeft, Settings } from 'lucide-react';

import { useCalendar } from '../contexts/CalendarContext';
import { AuthContext } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { useTools } from '../contexts/ToolsContext';

import { useIsDesktop } from '../utils/utils';

const SelectionCalendarLayout = ({children}) => {

    const isDesktop = useIsDesktop();
    const { selected, resetSelected, back, resetActivity, resetEvent, resetAvailability } = useCalendar();
    const { calendarSettings, setCalendarSettings, user } = useContext(AuthContext);
    const { resetTask } = useTask();
    const { resetRoom, resetDevice } = useTools();

    useEffect(() => {
        if (selected.selection === '...') {
            resetActivity();
            resetEvent();
            resetAvailability();
            resetTask();
            resetRoom();
            resetDevice();
        }
    }, [selected.selection]);

    return (
        <div className='d-flex flex-column w-100 my-md-3 bg-white border p-3 pt-2 form-popup rounded position-relative'>
            {(isDesktop && (selected.selection === '...' && !selected.edit && !user.isAdmin)) && (
                <div className='position-absolute end-0 top-25 translate-middle-y mt-4 me-3'>
                    <button type='button' aria-label='Settings' title='Settings' className='btn rounded-circle p-1 m-0' onClick={() => setCalendarSettings(!calendarSettings)}>
                        <Settings size={30} color='#888' strokeWidth='1.75' />
                    </button>
                </div>
            )}
            <div className='d-flex justify-content-between mt-3'>
                {(selected.add || selected.selection === '...') && (
                    <div className='fs-5'>
                        Add a new {selected.selection}
                    </div>
                )}

                {selected.edit && (
                    <div className='fs-5'>
                        Edit {selected.selection}
                    </div>
                )}

                {selected.selection === 'pomodoro' &&  !selected.edit && (
                    <div className='fs-5'>
                        Planned Pomodoro
                    </div>
                )}

                <div>
                    {selected.selection !== '...' ? (
                        <button type='button' aria-label='Back' title='Back' className='btn py-0 m-0' onClick={() => back()}>
                            <MoveLeft size={25} color='#555B6E' strokeWidth={1.75} />
                        </button>
                    ) : (
                        <>
                            {!isDesktop && (
                                <button type='button' aria-label='Exit' title='Exit' className='btn' onClick={() => resetSelected()}>
                                    <X size={25} color='#555B6E' strokeWidth={1.75} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <main className='d-flex w-100 justify-content-center overflow-hidden position-relative'>{children}</main>

            

        </div>

    )
}

export default SelectionCalendarLayout;