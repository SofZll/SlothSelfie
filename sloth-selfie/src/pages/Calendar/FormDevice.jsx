import React, { useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';

import { apiService } from '../../services/apiService';
import { useTools } from '../../contexts/ToolsContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { generateTimeOptions } from '../../utils/utils';

const FormDevice = () => {
    const { devices, setDevices, device, setDevice, resetDevice } = useTools();
    const { selected, resetSelected, conditionsMet, setConditionsMet, deletePopUp, setDeletePopUp } = useCalendar();

    const setDaysOff = (selectedValue) => {
        const isAlreadySelected = device.freeDays.includes(selectedValue);
        if (isAlreadySelected) setDevice({ ...device, freeDays: device.freeDays.filter((day) => day !== selectedValue) });
        else setDevice({ ...device, freeDays: [...device.freeDays, selectedValue] });
    };

    const handleSubmit = async () => {
        const response = await apiService(`/user/device${selected.edit ? `/${device._id}` : ''}`, selected.edit ? 'PUT' : 'POST', device);
        if (response.success) {
            if (selected.edit) {
                setDevices([...devices.filter((d) => d._id !== response.device._id), { ...response.device, type: 'device' }]);
                NewSwal.fire({ title: 'Device edited', icon: 'success', text: 'Device edited successfully'});
            } else {
                setDevices([...devices, { ...response.device, type: 'device', events: [], availabilities: [] }]);
                NewSwal.fire({ title: 'Device created', icon: 'success', text: 'Device created successfully'});
            }
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
        resetDevice();
        resetSelected();
    }

    const deleteDevice = async () => {
        const response = await apiService(`/user/device/${deletePopUp.toShow._id}`, 'DELETE');
        if (response.success) {
            setDevices([...devices.filter((d) => d._id !== deletePopUp.toShow._id)]);
            NewSwal.fire({ title: 'Device deleted', icon: 'success', text: 'Device deleted successfully'});
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
        setDeletePopUp({ toCall: false, type: '', show: false, toShow: {} });
        resetSelected();
    }

    const openDeletePopUp = () => {
        setDeletePopUp({ ...deletePopUp, toShow: device, type: 'device', show: true });
        resetDevice();
    }

    useEffect(() => {
        if (!device.username || device.username.length <= 0) {
            setConditionsMet(false);
        } else if (device.dayHours.start === '' || device.dayHours.end === '') {
            setConditionsMet(false);
        } else if (device.dayHours.start === device.dayHours.end) {
            setConditionsMet(false);
        } else {
            setConditionsMet(true);
        }
    }, [device.username, device.dayHours.start, device.dayHours.end]);

    useEffect(() => {
        if (deletePopUp.toCall && deletePopUp.type === 'device') {
            deleteDevice();
        }
    }, [deletePopUp.toCall]);

    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden'>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='name' className='form-label'>Device name</label>
                    <input type='text' className='form-control' id='name'
                        value={device.username}
                        onChange={(e) => setDevice({ ...device, username: e.target.value })}
                        placeholder='Enter device name' />
                </div>
            </div>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='start' className='form-label'>Available from</label>
                    <select className='form-select' id='start'
                        value={device.dayHours.start}
                        onChange={(e) => setDevice({ ...device, dayHours: { ...device.dayHours, start: e.target.value } })}>
                        {generateTimeOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div className='col-6'>
                    <label htmlFor='end' className='form-label'>Available until</label>
                    <select className='form-select' id='end'
                        value={device.dayHours.end}
                        onChange={(e) => setDevice({ ...device, dayHours: { ...device.dayHours, end: e.target.value } })}>
                        {generateTimeOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='row py-2 '>
                <div className='col-8'>
                    <label htmlFor='daysOff' className='form-label'>Days off</label>
                    <select className='form-select' id='daysOff'
                        value={device.freeDays}
                        onChange={(e) => setDaysOff(e.target.value)}
                        multiple>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <button type='button' aria-label='edit-save' className='btn btn-primary mx-2' onClick={handleSubmit} disabled={!conditionsMet}>
                    {selected.edit ? 'edit' : 'save'}
                </button>
                {selected.edit && <button type='button' aria-label='delete device' className='btn btn-danger mx-2' onClick={() => openDeletePopUp()}>Delete Device</button>}
            </div>
        </div>
    );
}
export default FormDevice;