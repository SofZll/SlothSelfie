import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Form({ formType, setFormType, handleLogin}) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formType === 'login') {
            if (!username || !password) {
                alert('Please enter a username and password!');
                return;
            }

            fetch('http://localhost:8000/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Login successful:', data);
                    handleLogin(true);
                    navigate('/home');
                }
                else {
                    console.error('Login failed:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error login:', error);
            });

        } else if (formType === 'register') {
            if (!username || !email || !password) {
                alert('Please enter a username, email, and password!');
                return;
            }

            fetch('http://localhost:8000/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, username, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Registration successful:', data);
                }
                else {
                    console.error('Registration failed:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error registering:', error);
            });
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
                    {formType === 'register' && (
                        <div className="form-group">
                            <input
                                type="text"
                                id="name"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
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
                            <>Don't have an account? <span className="register-link" onClick={() => setFormType('register')}>Register!</span></>
                        ) : (
                            <>Already have an account? <span className="register-link" onClick={() => setFormType('login')}>Login!</span></>
                        )}
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Form;