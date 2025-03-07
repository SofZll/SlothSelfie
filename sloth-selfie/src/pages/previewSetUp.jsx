import React, { useState } from 'react';
import '../css/setting.css';

import { X } from 'lucide-react';

function PreviewSetUp(props) {

    const [isSetting, setIsSetting] = useState('calendar');

    const handleSetUp = () => {
        props.setSetUp(!props.setUp);
    };

    const handleSetting = (setting) => {
        setIsSetting(setting);
    };

    return (
        <div className='d-flex position-relative rounded-3 mb-5 p-3 bg-white card-settings'>
            <button className='btn position-absolute end-0 top-0' onClick={handleSetUp} alt='exit'>
                <X size={36} color='#555B6E' strokeWidth={1.75} />
            </button>
            
            <div className='d-flex flex-row w-100'>
                <div className='d-flex flex-column border-end w-25'>
                </div>

                <div className='cd-flex flex-column w-75'>
                </div>
            </div>
            
        </div>
    );
}

export default PreviewSetUp;
