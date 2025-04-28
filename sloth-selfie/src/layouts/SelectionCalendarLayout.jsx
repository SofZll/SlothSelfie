import React, { useEffect } from 'react';
import { useIsDesktop } from '../utils/utils';

import { X, MoveLeft } from 'lucide-react';

import { useCalendar } from '../contexts/CalendarContext';
import { useTask } from '../contexts/TaskContext';

const SelectionCalendarLayout = ({children}) => {

    const isDesktop = useIsDesktop();
    const { selected, resetSelected, back, resetActivity, resetEvent, resetAvailability } = useCalendar();
    const { resetTask } = useTask();

    useEffect(() => {
        if (selected.selection === '...') {
            resetActivity();
            resetEvent();
            resetAvailability();
            resetTask();
        }
    }, [selected.selection]);

    return (
        <div className='d-flex flex-column w-100 my-md-3 bg-white border p-3 rounded'>

            <div className='d-flex justify-content-between my-3'>
                {selected.add || selected.selection === '...' && (
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
                        <button className='btn py-0 m-0' onClick={() => back()} alt='back'>
                            <MoveLeft size={25} color='#555B6E' strokeWidth={1.75} />
                        </button>
                    ) : (
                        <>
                            {!isDesktop && (
                                <button className='btn' onClick={() => resetSelected()} alt='exit'>
                                    <X size={25} color='#555B6E' strokeWidth={1.75} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <main className='d-flex justify-content-center form-popup'>{children}</main>

            

        </div>

    )
}

export default SelectionCalendarLayout;