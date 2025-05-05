import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authSloth from '../assets/icons/authSloth.png';
import { NewSwal } from '../utils/swalUtils';

import { validateLogin, validateRegistration } from '../utils/validation.js'
import AuthLayout from '../layouts/AuthLayout';
import { apiService } from '../services/apiService';
import { AuthContext } from '../contexts/AuthContext';

// TODO: choose a library for icons react-icons or lucide-rect
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function getCursorPosition(event) {
    const x = (event.clientX * 100) / window.innerWidth + "%";
    const y = (event.clientY * 100) / window.innerHeight + "%";
  
    const eyes1 = document.getElementById("eyes1");
    const eyes2 = document.getElementById("eyes2");
  
    eyes1.style.left = x;
    eyes1.style.top = y;
    eyes1.style.transform = `translate(-${x}, -${y})`;
  
    eyes2.style.left = x;
    eyes2.style.top = y;
    eyes2.style.transform = `translate(-${x}, -${y})`;
}

const AuthPage = ({ formType = 'login' }) => {
    const { fetchUserData, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentFormType, setcurrentFormType] = useState(formType);
    const [showPassword, setShowPassword] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentFormType === 'login' && validateLogin(userInfo.username, userInfo.password)) {
            const response = await apiService('/user/login', 'POST', { username: userInfo.username, password: userInfo.password });
            if (response && response.success) {
                const newUser = await fetchUserData();

                if (newUser.isAdmin) navigate('/admin');
                else navigate('/home');

            } else {
                console.error('Error logging in:', response);
                NewSwal.fire({ title: 'Login failed', icon: 'error', text: response.message});
            }
        } else if (currentFormType === 'register' && validateRegistration(userInfo.name, userInfo.username, userInfo.email, userInfo.password)) {
            const response = await apiService('/user/register', 'POST', userInfo);
            if (response && response.success) {
                console.log('User registered');
                setcurrentFormType('login');
                navigate('/login');
            } else {
                console.error('Error registering:', response);
                NewSwal.fire({ title: 'Registration failed', icon: 'error', text: response.message});
            }
        } else NewSwal.fire({ title: 'Invalid input', icon: 'error', text: 'Please fill in all fields'});
    }

    return (
        <AuthLayout>
            <div className='container-auth' onMouseMove={(e) => getCursorPosition(e)}>
                <img src={authSloth} alt='authSloth' className='auth-sloth' />
                <div className='eye-cover1'>
                    <div id='eyes1'></div>
                </div>
                <div className='eye-cover2'>
                    <div id='eyes2'></div>
                </div>
                <div className={`col login-box ${currentFormType === 'register' ? 'registration-form' : 'login-form'}`}>
                    <h1 className='login-title'>{currentFormType === 'login' ? 'Welcome to Sloth Selfie!' : 'Register for Sloth Selfie!'}</h1>
                    <form className='row g-3' onSubmit={handleSubmit}>
                        {currentFormType === 'register' && (
                            <div className={`form-floating form-group-auth ${currentFormType === 'register' ? 'col-6' : 'col-12'}`}>
                                <input type='text' id='name' className='form-control' placeholder='name' value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} required />
                                <label htmlFor='name'>Name</label>
                            </div>
                        )}
                        <div className={`form-floating form-group-auth ${currentFormType === 'register' ? 'col-6' : 'col-12'}`}>
                            <input type='text' id='username' className='form-control' placeholder='username' value={userInfo.username} onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })} required />
                            <label htmlFor='username'>Username</label>
                        </div>
                        {currentFormType === 'register' && (
                            <div className='form-floating form-group-auth col-16'>
                                <input type='email' id='email' className='form-control' placeholder='Email' value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} required />
                                <label htmlFor='email'>Email</label>
                            </div>
                        )}
                        <div className='form-floating form-group-auth col-16'>
                            <input type={showPassword ? 'text' : 'password'} id='password' className='form-control' placeholder='Password' value={userInfo.password} onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })} required />
                            <span className='toggle-password' onClick={() => setShowPassword(!showPassword)}>
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </span>
                            <label htmlFor='password'>Password</label>
                        </div>
                        <div className='form-group-auth col-16'>
                            <button type='submit' className='login-button'>
                                {currentFormType === 'login' ? 'LOGIN' : 'REGISTER'}
                            </button>
                        </div>
                        <p className='register'>
                            {currentFormType === 'login' ? (
                                <>Don't have an account? <span className='register-link' onClick={() => setcurrentFormType('register')}>Register!</span></>
                            ) : (
                                <>Already have an account? <span className='register-link' onClick={() => setcurrentFormType('login')}>Login!</span></>
                            )}
                        </p>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AuthPage;