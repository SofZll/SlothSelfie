import React, { useEffect, useContext } from 'react';
import Select from 'react-select';

import { NewSwal } from '../../utils/swalUtils';

import { generateTimeOptions } from '../../utils/utils';
import { apiService } from '../../services/apiService';

import { useCalendar } from '../../contexts/CalendarContext';
import { useTools } from '../../contexts/ToolsContext';
import { AuthContext } from '../../contexts/AuthContext';

const FormNoAvailability = () => {

    const { availability, setAvailability, availabilities, setAvailabilities, resetAvailability, selected, resetSelected, setConditionsMet, conditionsMet, deletePopUp, setDeletePopUp } = useCalendar();
    const { selectedRooms, setSelectedRooms, selectedDevices, setSelectedDevices, rooms, devices, setRooms, setDevices } = useTools();
    const { user } = useContext(AuthContext);

    const setStartDate = (date) => {
        const newDate = new Date(date);
        if (availability.days) {
            newDate.setHours(0, 0, 0, 0);
            setAvailability({ ...availability, startDate: newDate });
        } else {
            newDate.setHours(new Date(availability.startDate).getHours(), new Date(availability.startDate).getMinutes(), 0, 0);
            if (selected.edit) {
                const newEndDate = new Date(newDate);
                newEndDate.setHours(newEndDate.getHours() + parseInt(availability.duration), newEndDate.getMinutes(), 0, 0);
                setAvailability({ ...availability, startDate: newDate, endDate: newEndDate });
            } else setAvailability({ ...availability, startDate: newDate });
        }
    }

    const setEndDate = (date) => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        setAvailability({ ...availability, endDate: newDate });
        console.log(availability);
    }


    const setStartTime = (time) => {
        const [hours, minutes] = time.split(':');
        const newDate = new Date(availability.startDate);
        const newEndDate = new Date(availability.startDate);
        newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        newEndDate.setHours(parseInt(hours) + parseInt(availability.duration), parseInt(minutes), 0, 0);

        setAvailability({ ...availability, startTime: time, startDate: newDate, endDate: newEndDate });
    }

    const setEndTime = (duration) => {
        if (!duration) setAvailability({ ...availability, duration: null });
        else {
            const newDate = new Date(availability.startDate);
            newDate.setHours(newDate.getHours() + parseInt(duration), newDate.getMinutes(), 0, 0);
            setAvailability({ ...availability, endDate: newDate, duration: parseInt(duration) });
        }
    }

    const roomOptions = [
        ...rooms.map(room => ({ value: room._id, label: room.username }))
    ];

    const deviceOptions = [
        ...devices.map(device => ({ value: device._id, label: device.username }))
    ];

    const handleChange = (type) => (newValue) => {
        const listId = newValue.map(item => item.value);
       
        if (type === 'room') {
            setSelectedRooms([...listId]);
        } else if (type === 'device') {
            setSelectedDevices([...listId]);
        }
    }

    const handleSubmit = async () => {
        
        if (!availability.days) {

            if (!availability.endDate > new Date(availability.startDate).setHours(23, 59, 59, 999)) {
                NewSwal.fire({ title: 'Warning', icon: 'warning', text: 'End time must be before the next day'});
                return;
            }
        }

        if (availability.repeatFrequency !== 'none') {
            let gap = 1;
            if (availability.repeatFrequency === 'weekly') gap = 7;
            else if (availability.repeatFrequency === 'monthly') gap = 30;
            else if (availability.repeatFrequency === 'yearly') gap = 365;

            if (new Date(availability.endDate).getDate() >= new Date(availability.startDate).getDate() + gap) {
                NewSwal.fire({ title: 'Warning', icon: 'warning', text: 'End date must be before the next occurrence'});
                return;
            }
        }

        const response = await apiService(`/no-availability/${selected.edit ? availability._id : ''}`, selected.edit ? 'PUT' : 'POST', {...availability, tools: (user.isAdmin ? [...selectedRooms, ...selectedDevices] : [])});

        if (response.success) {
            NewSwal.fire({ title: selected.edit ? 'Availability edited' : 'Availability added', icon: 'success', text: selected.edit ? 'Availability edited successfully' : 'Availability added successfully'});
            if (selected.edit) {
                if (user.isAdmin) {
                    const response = await apiService('/users/tools', 'GET');
                    if (response.success) {
                        setRooms(response.rooms);
                        setDevices(response.devices);
                    }
                } else {
                    setAvailabilities([...availabilities.filter(a => a.fatherId !== availability.fatherId && a._id !== availability._id), ...response.listNoAvailability]);
                }
            }
            else {
                if (user.isAdmin) {
                    const response = await apiService('/users/tools', 'GET');
                    if (response.success) {
                        setRooms(response.rooms);
                        setDevices(response.devices);
                    }
                } else {
                    setAvailabilities([...availabilities, ...response.listNoAvailability]);
                }
            }
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message});

        resetAvailability();
        resetSelected();
    }

    const deleteAvailability = async () => {
        const response = await apiService(`/no-availability/${deletePopUp.toShow._id}`, 'DELETE');
        if (response.success) {
            NewSwal.fire({ title: 'Availability deleted', icon: 'success', text: 'Availability deleted successfully'});
            if (user.isAdmin) {
                const response = await apiService('/users/tools', 'GET');
                if (response.success) {
                    setRooms(response.rooms);
                    setDevices(response.devices);
                }
            } else {
                if (deletePopUp.toShow.repeatFrequency === 'none') setAvailabilities(availabilities.filter(a => a._id !== deletePopUp.toShow._id));
                else setAvailabilities(availabilities.filter(a => a.fatherId !== deletePopUp.toShow._id && a._id !== deletePopUp.toShow._id));
            }
        } else NewSwal.fire({ title: 'Error deleting availability', icon: 'error', text: response.message});
        setDeletePopUp({ toCall: false, type: '', show: false, toShow: {} });
        resetSelected();
    }

    const openDeletePopUp = () => {
        setDeletePopUp({ ...deletePopUp, toShow: availability, type: 'no availability', show: true });
        resetAvailability();
    }

    useEffect(() => {
        if (deletePopUp.toCall && deletePopUp.type === 'no availability') {
            deleteAvailability();
        }
    }, [deletePopUp.toCall]);

    useEffect(() => {
        if (!availability.startDate || !availability.endDate) {
            setConditionsMet(false);
        }else if (!availability.days && (!availability.startTime || !availability.duration)) {
            setConditionsMet(false);
        } else if (availability.startDate > availability.endDate) {
            setConditionsMet(false);
        } else if (availability.repeatFrequency !== 'none' && (!availability.numberOfOccurrences || availability.numberOfOccurrences < 1)) {
            setConditionsMet(false);
        } else {
            setConditionsMet(true);
        }
    }, [availability.startDate, availability.endDate, availability.repeatFrequency, availability.numberOfOccurrences]);

    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden'>
            {((user.isAdmin && selected.add) || availability.tool) && (
                <div className='row py-2 w-100'>
                    {selected.edit ? (
                        <div className='col-12'>
                            <div className='d-inline-block form-label'>
                                Tool: 
                            </div>
                            <div className='d-inline-flex ms-2 fst-italic fw-semibold sloth-blue'>
                                {availability.title.split(" no Availability")[0]}
                            </div>
                        </div>
                    ) : (
                        <>
                        <div className='col-6'>
                            <label htmlFor='room' className='form-label'>Room</label>
                            <Select
                            isMulti
                            classNamePrefix='rooms'
                            options={roomOptions}
                            value={roomOptions.filter(opt => selectedRooms.includes(opt.value))}
                            onChange={handleChange('room')}
                            placeholder={'0 rooms'}
                            />
                        </div>
                        <div className='col-6'>
                            <label htmlFor='devices' className='form-label'>Devices</label>
                            <Select
                            isMulti
                            classNamePrefix='devices'
                            options={deviceOptions}
                            value={deviceOptions.filter(opt => selectedDevices.includes(opt.value))}
                            onChange={handleChange('device')}
                            placeholder={'0 devices'}
                            />
                        </div>
                        </>
                    )}
                </div>
            )}
            
            <div className='row py-2 w-100'>
                <div className='col-6'>
                    <label htmlFor='startDate' className='form-label'>Start Date</label>
                    <input type='date' className='form-control' id='startDate'
                        value={new Date(availability.startDate).toLocaleDateString('en-CA')}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={availability.tool && !user.isAdmin}
                        required />
                </div>
                {availability.days ? (
                    <div className='col-6'>
                        <label htmlFor='endDate' className='form-label'>End Date</label>
                        <input type='date' className='form-control' id='endDate'
                        value={new Date(availability.endDate).toLocaleDateString('en-CA')}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={availability.tool && !user.isAdmin}
                        required />
                    </div>
                ) : (
                    <div className='col-6'>
                        <label htmlFor='time' className='form-label'>Time</label>
                        <select className='form-select' id='time'
                        value={availability.startTime}
                        disabled={availability.tool && !user.isAdmin}
                        onChange={(e) => setStartTime(e.target.value)}>
                            <option value=''>Select time</option>
                            {generateTimeOptions().map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className='row py-2 w-100'>
                <div className='col col-auto form-check form-switch ms-3'>
                    <input className='form-check-input' type='checkbox' id='days'
                        checked={!availability.days}
                        disabled={availability.tool && !user.isAdmin}
                        onChange={(e) => setAvailability({ ...availability, days: !e.target.checked })} />
                    <label className='form-check-label' htmlFor='days'>it lasts hours</label>
                </div>
            </div>

            {!availability.days && (
                <div className='row py-2 w-100'>
                    <div className='col-10'>
                        <label htmlFor='duration' className='form-label'>Duration</label>
                        <input type='number' className='form-control' id='duration'
                        placeholder='Duration in hours'
                        value={availability.duration}
                        disabled={availability.tool && !user.isAdmin}
                        onChange={(e) => setEndTime(e.target.value)}
                        min={1}
                        required />
                    </div>
                </div>
            )}

            <div className='row py-2 w-100'>
                <div className='col col-6'>
                    <label htmlFor='repeatFrequency' className='form-label'>Repeat Frequency</label>
                    <select className='form-select' name='repeatFrequency'
                    value={availability.repeatFrequency}
                    disabled={availability.tool && !user.isAdmin}
                    onChange={(e) => setAvailability({ ...availability, repeatFrequency: e.target.value })}>
                        <option value='none'>None</option>
                        <option value='daily'>Daily</option>
                        <option value='weekly'>Weekly</option>
                        <option value='monthly'>Monthly</option>
                        <option value='yearly'>Yearly</option>
                    </select>
                </div>
                {availability.repeatFrequency !== 'none' && (
                    <div className='col col-6'>
                        <label htmlFor='numberOfOccurrences' className='form-label'>Number of Occurrences</label>
                        <input type='number' className='form-control' id='numberOfOccurrences'
                        placeholder='Number of occurrences'
                        disabled={availability.tool && !user.isAdmin}
                        value={availability.numberOfOccurrences}
                        onChange={(e) => setAvailability({ ...availability, numberOfOccurrences: e.target.value })}
                        min={1}
                        required />
                    </div>
                )}
            </div>

            {(!availability.tool || user.isAdmin) && (
                <div className='d-flex align-items-center justify-content-center'>
                    <button type='button' aria-label='edit-save' className='btn-main rounded shadow-sm mt-4' disabled={!conditionsMet} onClick={() => handleSubmit()}>{selected.edit ? 'edit' : 'save'}</button>
                    {selected.edit && (
                        <button type='button' aria-label='delete' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => openDeletePopUp()}>
                            delete
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default FormNoAvailability;