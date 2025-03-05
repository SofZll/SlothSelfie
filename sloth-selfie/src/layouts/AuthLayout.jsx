import React from 'react';
import '../styles/AuthLayout.css';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-layout">
            {children}
        </div>
    );
}

export default AuthLayout;