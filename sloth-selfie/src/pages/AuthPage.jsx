import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateLogin, validateRegistration } from '../utils/validation.js'
import AuthLayout from '../layouts/AuthLayout';
import { apiService } from '../services/apiService';
import Swal from 'sweetalert2';

// TODO: choose a library for icons react-icons or lucide-rect
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// TODO: use bootstrap for styling
const AuthPage = ({ formType = 'login', setAuthenticated }) => {
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
            const response = await apiService('/user/login', 'POST', { username: userInfo.username, password: userInfo.password })
                if (response) {
                    console.log('User logged in');
                    localStorage.setItem('authToken', response.token);
                    setAuthenticated(true);
                    navigate('/home');
                } else {
                    console.error('Error logging in:', response);
                    Swal.fire({ title: 'Login failed', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
                }
        } else if (currentFormType === 'register' && validateRegistration(userInfo)) {
            const response = await apiService('/user/register', 'POST', userInfo)
                if (response) {
                    console.log('User registered');
                    // TODO: logic after registering user
                } else {
                    console.error('Error registering:', response);
                    Swal.fire({ title: 'Registration failed', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
                }
        } else Swal.fire({ title: 'Invalid input', icon: 'error', text: 'Please fill in all fields', customClass: { confirmButton: 'button-alert' } });
    }

    return (
        <AuthLayout>
            <div className="login-container">
                <div className="login-box">
                    <h1 className="login-title">{currentFormType === 'login' ? 'Welcome to Sloth Selfie!' : 'Register for Sloth Selfie!'}</h1>
                    <form id={`login-form`} onSubmit={handleSubmit}>
                        {currentFormType === 'register' && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Name"
                                    value={userInfo.name}
                                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <input
                                type="text"
                                id="username"
                                placeholder="Username"
                                value={userInfo.username}
                                onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                                required
                            />
                        </div>
                        {currentFormType === 'register' && (
                            <div className="form-group">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group password-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Password"
                                value={userInfo.password}
                                onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                                required
                            />
                            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </span>
                        </div>
                        <button type="submit" className="login-button">
                            {currentFormType === 'login' ? 'LOGIN' : 'REGISTER'}
                        </button>
                        <p className="register">
                            {currentFormType === 'login' ? (
                                <>Don't have an account? <span className="register-link" onClick={() => setcurrentFormType('register')}>Register!</span></>
                            ) : (
                                <>Already have an account? <span className="register-link" onClick={() => setcurrentFormType('login')}>Login!</span></>
                            )}
                        </p>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AuthPage;