import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing } from 'lucide-react';

import '../styles/NotificationButton.css';

const NotificationButton = () => {
    const navigate = useNavigate();

    return (
        <div className='notification-wrapper'>
            <button className='notification-button' onClick={() => navigate('/notifications')}>
                <BellRing size={27} color='#fff'/>
            </button>
        </div>
    );
}

export default NotificationButton;