import React, { useContext } from 'react';

import { useTools } from '../contexts/ToolsContext';
import { useCalendar } from '../contexts/CalendarContext';
import { AuthContext } from '../contexts/AuthContext';

import { Pen } from 'lucide-react';

const CardTool = ({ tool, smallView }) => {

    const { setSelected } = useCalendar();
    const { setRoom, setDevice } = useTools();
    const { user } = useContext(AuthContext);

    const selectTool = () => {
        if (tool.type === 'room') {
            setRoom({ ...tool });
        } else if (tool.type === 'device') {
            setDevice({ ...tool });
        }
        setSelected({ selection: tool.type, edit: true, add: false, popup: true });
    }

    return (
        <div className='d-flex flex-column w-100 align-items-center border rounded shadow-sm p-md-3 p-1 position-relative'>
            
            <div className='row w-100'>
                <div className='col col-6 text-break activity-title fw-bold text-center'>
                    {tool.username}
                </div>
                <div className='col col-6 activity-title text-break activity-title fst-italic'>
                    {tool.type}
                </div>
            </div>

            {!smallView && (
                <div className='d-flex flex-column w-100 p-2'>
                    <div className='d-flex w-100'>
                        <div className='d-inline-block'>Open:</div>
                        <div className='d-flex w-75 fst-italic justify-content-center'>
                            {tool.dayHours.start} - {tool.dayHours.end}
                        </div>
                    </div>
                    <div className='row w-100 p-2'>
                        <div className='col col-12'>
                            <div className='d-flex w-100'>Free Days:</div>
                            <div className='d-flex w-100 fst-italic justify-content-center'>
                                {tool.freeDays.length > 0 ? 
                                    (tool.freeDays.length === 7 ? 'Always closed' : tool.freeDays.map((day, index) => {
                                        return index === tool.freeDays.length - 1 ? day : day + ', ';
                                    }))
                                : 'Always open'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {user.isAdmin && (
                <button type='button' aria-label='Edit' title='Edit' className='btn position-absolute top-0 end-0 p-0' onClick={() => selectTool()}>
                    <Pen size={20} color='#244476' strokeWidth={1.25} />
                </button>
            )}
        </div>
    )
}

export default CardTool;