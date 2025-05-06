import React, { useState, useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';

import { apiService } from '../../services/apiService';
import { useTools } from '../../contexts/ToolsContext';
import { useCalendar } from '../../contexts/CalendarContext';

import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';

const FormRoom = () => {
    const { rooms, setRooms, room, setRoom, resetRoom } = useTools();
    const { selected, resetSelected, conditionsMet, setConditionsMet } = useCalendar();

    const [showDeletePopUp, setShowDeletePopUp] = useState(false);

    const handleSubmit = async () => {
        const response = await apiService('/user/rooms', (selected.edit ? 'PUT' : 'POST'), room);
        if (response.success) {
            if (selected.edit) {
                setRooms([...rooms.filter((r) => r._id !== response.room._id), { ...response.room }]);
                NewSwal.fire({ title: 'Room edited', icon: 'success', text: 'Room edited successfully'});
            } else {
                setRooms([...rooms, { ...room }]);
                NewSwal.fire({ title: 'Room created', icon: 'success', text: 'Room created successfully'});
            }
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
        resetRoom();
        resetSelected();
    }

    const deleteRoom = async () => {
        const response = await apiService(`/user/rooms/${room._id}`, 'DELETE');
        if (response.success) {
            setRooms([...rooms.filter((r) => r._id !== room._id)]);
            NewSwal.fire({ title: 'Room deleted', icon: 'success', text: 'Room deleted successfully'});
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
        resetRoom();
        resetSelected();
    }

    useEffect(() => {
        if (!room.username || room.username.length <= 0) {
            setConditionsMet(false);
        } else setConditionsMet(true);
    }, [room.username]);

    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden'>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='name' className='form-label'>Room name</label>
                    <input type='text' className='form-control' id='name'
                        value={room.name}
                        onChange={(e) => setRoom({ ...room, username: e.target.value })}
                        placeholder='Enter room name' />
                </div>
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' className='btn-main rounded shadow-sm mt-4' disabled={!conditionsMet} onClick={() => handleSubmit()} >
                    {selected.edit ? 'edit' : 'save'}
                </button>

                {selected.edit && (
                    <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => setShowDeletePopUp(true)}>
                        delete
                    </button>
                )}
            </div>

            {showDeletePopUp && (
                <DeletePopUpLayout handleDelete={deleteRoom} handleClose={() => setShowDeletePopUp(false)}>
                    <div className='d-flex flex-column text-start'>
                        Are you sure you want to delete this room?
                    </div>
                    <div className='d-flex flex-column'>
                        <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{room.username}</div>
                        <div className='fst-italic' style={{ color: '#244476' }}>{room.events.lenth} hosted event{room.events.lenth === 1 ? '' : 's'}</div>
                    </div>
                </DeletePopUpLayout>
            )}
        </div>
    );
}

export default FormRoom;


