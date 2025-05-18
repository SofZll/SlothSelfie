import React from 'react';
import '../styles/Auth.css';
import Header from '../components/Header';

const AuthLayout = ({ children }) => {
    return (
        <div>
            <Header />
            <main>
                {children}    
            </main>
        </div>
    );
}

export default AuthLayout;