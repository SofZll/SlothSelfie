import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

import { LogOut } from 'lucide-react';
import { NewSwal } from '../utils/swalUtils';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const handleLogout = async () => {
        const response = await apiService('/user/logout', 'POST');
        if (response.success) {
            setUser(null);
        } else NewSwal.fire({ title: 'Error logging out', icon: 'error', text: response.message});

        navigate('/login');
    }

    return (
        <button type='button' aria-label='Logout' className='btn position-fixed top-0 end-0 p-3' onClick={handleLogout}>
            <LogOut size='25' strokeWidth='1.75' color='#244476' />
        </button>
    );
}

export default LogoutButton;