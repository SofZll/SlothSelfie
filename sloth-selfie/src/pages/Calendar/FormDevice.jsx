import React, { useState, useEffect } from 'react';

import { NewSwal } from '../../utils/swalUtils';

import { apiService } from '../../services/apiService';
import { useTools } from '../../contexts/ToolsContext';
import { useCalendar } from '../../contexts/CalendarContext';

import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';

const FormDevice = () => {
    const { devices, setDevices, device, setDevice, resetDevice } = useTools();
    const { selected, resetSelected, conditionsMet, setConditionsMet } = useCalendar();

    const [showDeletePopUp, setShowDeletePopUp] = useState(false);

    const handleSubmit = async () => {
        const response = await apiService('/user/devices', (selected.edit ? 'PUT' : 'POST'), device);
        if (response.success) {
            if (selected.edit) {
                setDevices([...devices.filter((d) => d._id !== response.device._id), { ...response.device }]);
                NewSwal.fire({ title: 'Device edited', icon: 'success', text: 'Device edited successfully'});
            } else {
                setDevices([...devices, { ...device }]);
                NewSwal.fire({ title: 'Device created', icon: 'success', text: 'Device created successfully'});
            }
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
        resetDevice();
        resetSelected();
    }

    const deleteDevice = async () => {
        const response = await apiService(`/user/devices/${device._id}`, 'DELETE');
        if (response.success) {
            setDevices([...devices.filter((d) => d._id !== device._id)]);
            NewSwal.fire({ title: 'Device deleted', icon: 'success', text: 'Device deleted successfully'});
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: response.message });
        resetDevice();
        resetSelected();
    }

    useEffect(() => {
        if (!device.username || device.username.length <= 0) {
            setConditionsMet(false);
        } else setConditionsMet(true);
    }, [device.username]);

    return (
        <div className='d-flex flex-column w-100 overflow-x-hidden'>
            <div className='row py-2 '>
                <div className='col-6'>
                    <label htmlFor='name' className='form-label'>Device name</label>
                    <input type='text' className='form-control' id='name'
                        value={device.name}
                        onChange={(e) => setDevice({ ...device, username: e.target.value })}
                        placeholder='Enter device name' />
                </div>
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <button className='btn btn-primary mx-2' onClick={handleSubmit} disabled={!conditionsMet}>
                    {selected.edit ? 'edit' : 'save'}
                </button>
                {selected.edit && <button className='btn btn-danger mx-2' onClick={() => setShowDeletePopUp(true)}>Delete Device</button>}
            </div>
            
            {showDeletePopUp && (
                <DeletePopUpLayout handleDelete={deleteDevice} handleClose={() => setShowDeletePopUp(false)}>
                    <div className='d-flex flex-column text-start'>
                        Are you sure you want to delete this device?
                    </div>
                    <div className='d-flex flex-column'>
                        <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{device.username}</div>
                        <div className='fst-italic' style={{ color: '#244476' }}>used {device.events.lenth} in event{device.events.lenth === 1 ? 's' : ''}</div>
                    </div>
                </DeletePopUpLayout>
            )}
        </div>
    );
}
export default FormDevice;