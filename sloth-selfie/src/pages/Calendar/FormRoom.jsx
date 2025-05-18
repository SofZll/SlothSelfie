import React, { useState, useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';

import { apiService } from '../../services/apiService';
import { useTools } from '../../contexts/ToolsContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { generateTimeOptions } from '../../utils/utils';

import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';

const FormRoom = () => {
    const { rooms, setRooms, room, setRoom, resetRoom } = useTools();
    const { selected, resetSelected, conditionsMet, setConditionsMet } = useCalendar();

    const [showDeletePopUp, setShowDeletePopUp] = useState(false);

    const setDaysOff = (selectedValue) => {
        const isAlreadySelected = room.freeDays.includes(selectedValue);
        if (isAlreadySelected) setRoom({ ...room, freeDays: room.freeDays.filter((day) => day !== selectedValue) });
        else setRoom({ ...room, freeDays: [...room.freeDays, selectedValue] });
    };

    const handleSubmit = async () => {
        const response = await apiService(`/user/room${selected.edit ? `/${room._id}` : ''}`, selected.edit ? 'PUT' : 'POST', room);
        if (response.success) {
            if (selected.edit) {
                setRooms([...rooms.filter((r) => r._id !== response.room._id), { ...response.room, type: 'room' }]);
                NewSwal.fire({ title: 'Room edited', icon: 'success', text: 'Room edited successfully'});
            } else {
                setRooms([...rooms, { ...response.room, type: 'room' }]);
                NewSwal.fire({ title: 'Room created', icon: 'success', text: 'Room created successfully'});
            }
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
        resetRoom();
        resetSelected();
    }

    const deleteRoom = async () => {
        const response = await apiService(`/user/room/${room._id}`, 'DELETE');
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
        } else if (room.dayHours.start === '' || room.dayHours.end === '') {
            setConditionsMet(false);
        } else if (room.dayHours.start === room.dayHours.end) {
            setConditionsMet(false);
        } else setConditionsMet(true);
    }, [room.username, room.dayHours.start, room.dayHours.end]);

    useEffect(() => {
        console.log('Room:', room);
        console.log('Selected:', selected);
    }, [room, selected]);

    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden'>
            <div className='row py-2 '>
                <div className='col-8'>
                    <label htmlFor='name' className='form-label'>Room name</label>
                    <input type='text' className='form-control' id='name'
                        value={room.username}
                        onChange={(e) => setRoom({ ...room, username: e.target.value })}
                        placeholder='Enter room name' />
                </div>
            </div>
            <div className='row py-2 '>
                <div className='col-6 d-flex align-items-stretch justify-content-between flex-column'>
                    <label htmlFor='startWorkingHour'>Opening Time</label>
                    <select id='startWorkingHour' className='form-select'
                        value={room.dayHours.start}
                        onChange={(e) => setRoom({ ...room, dayHours: { ...room.dayHours, start: e.target.value } })}>
                        {generateTimeOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div className='col-6 d-flex align-items-stretch justify-content-between flex-column'>
                    <label htmlFor='endWorkingHour'>Closing Time</label>
                    <select id='endWorkingHour' className='form-select'
                        value={room.dayHours.end}
                        onChange={(e) => setRoom({ ...room, dayHours: { ...room.dayHours, end: e.target.value } })}>
                        {generateTimeOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='row py-2 '>
                <div className='col-8 d-flex align-items-stretch justify-content-between flex-column'>
                    <label htmlFor='daysOff'>Closed Days</label>
                    <select id='daysOff' className='form-select'
                        multiple
                        value={room.freeDays}
                        onChange={(e) => setDaysOff(e.target.value)}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                </div>
            </div>


            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' aria-label='edit-save' className='btn-main rounded shadow-sm mt-4' disabled={!conditionsMet} onClick={() => handleSubmit()} >
                    {selected.edit ? 'edit' : 'save'}
                </button>

                {selected.edit && (
                    <button type='button' aria-label='delete' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => setShowDeletePopUp(true)}>
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


