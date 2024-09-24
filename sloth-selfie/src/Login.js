import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import './css/Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Form({formType}) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formType === 'login') {
            // Handle login logic here
            console.log('Login - Username:', username);
            console.log('Login - Password:', password);
        } else if (formType === 'register') {
            // Handle registration logic here
            console.log('Register - Username:', username);
            console.log('Register - Email:', email);
            console.log('Register - Password:', password);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">{formType === 'login' ? 'Welcome to Sloth Selfie!' : 'Register for Sloth Selfie!'}</h1>
                <form id={`login-form`} onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {formType === 'register' && (
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group password-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span className="toggle-password" onClick={togglePasswordVisibility}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </span>
                    </div>
                    <button type="submit" className="login-button">
                        {formType === 'login' ? 'LOGIN' : 'REGISTER'}
                    </button>
                    <p className="register">
                        {formType === 'login' ? (
                            <>Don't have an account? <Link to="/register" className="register-link">Register!</Link></>
                        ) : (
                            <>Already have an account? <Link to="/login" className="register-link">Login!</Link></>
                        )}
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Form;