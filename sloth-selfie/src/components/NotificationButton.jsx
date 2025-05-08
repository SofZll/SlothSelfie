import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing } from 'lucide-react';

import '../styles/NotificationButton.css';
import { StyleContext } from '../contexts/StyleContext';

const NotificationButton = () => {
    const navigate = useNavigate();
    const { color } = useContext(StyleContext);

    return (
        <div className='notification-wrapper'>
            <button type='button' aria-label='notifications' title='Notifications' className='notification-button' onClick={() => navigate('/notifications')}>
                <BellRing size={27} color={ color } />
            </button>
        </div>
    );
}

export default NotificationButton;