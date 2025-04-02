import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import { useIsDesktop } from '../utils/utils';
import Swal from 'sweetalert2';

import { validateEmail, validatePhoneNumber } from '../utils/validation';
import MainLayout from '../layouts/MainLayout';
import { apiService } from '../services/apiService';
import { UserContext } from '../contexts/UserContext';
import { generateTimeOptions } from '../utils/utils';

const ProfilePage = () => {
    const { user, setUser  } = useContext(UserContext);

    const isDesktop = useIsDesktop();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [workHours, setWorkHours] = useState({ start: '', end: '', daysOff: [] });

    useEffect(() => {
        console.log(user);
    }, [user]);

    useEffect(() => {
        // Pre-populate the user settings with the UserContext fetch
        if (user) {
            setWorkHours({
                start: user.workingHours?.start || '',
                end: user.workingHours?.end || '',
                daysOff: user.freeDays || []
            });
        }
    }, [user]);

    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    const handleCloseSettings = () => {
        setShowSettings(false);
    };

    const validateWorkHours = () => {
        // start hour must be before the end hour
        if (workHours.start >= workHours.end) {
            Swal.fire({
                title: 'Invalid time range',
                text: 'The start time must be earlier than the end time.',
                icon: 'error',
                customClass: { confirmButton: 'button-alert' }
            });
            return false;
        }
        return true;
    };

    const handleSaveSettings = async () => {
        if (validateWorkHours()) {
            try {
                const updatedData = {
                    workingHours: {
                        start: workHours.start,
                        end: workHours.end
                    },
                    freeDays: workHours.daysOff
                };
    
                const response = await fetch('http://localhost:3000/api/user/edit-schedule', { //TODO CAMBIA NEL SERVER
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workingHours: { start: workHours.start, end: workHours.end },
                        freeDays: workHours.daysOff,
                        userId : user._id,
                    })
                });
                const data = await response.json();
                console.log('Response:', data);
                
                if (response.ok) {
                    console.log('Profile updated successfully:', response);
                    Swal.fire({
                        title: 'Success',
                        text: ' Settings saved correctly!',
                        icon: 'success',
                        customClass: { confirmButton: 'button-success' }
                    });
                    setUser({
                        ...user,
                        workingHours: updatedData.workingHours,
                        freeDays: updatedData.freeDays
                    });
                    setShowSettings(false);
                } else {
                    console.error('Failed to update profile:', response);
                    Swal.fire({
                        title: 'Error',
                        text: 'There was an issue saving your settings. Please try again.',
                        icon: 'error',
                        customClass: { confirmButton: 'button-alert' }
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'There was an issue saving your settings. Please try again later.',
                    icon: 'error',
                    customClass: { confirmButton: 'button-alert' }
                });
            }
        }
    };

    const handleClickImage = () => {
        document.getElementById('file-input').click();
    }

    const handleEditImage = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...setUser, profile_image: reader.result });
            }
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('image', file);
            
            const response = await apiService('/user/edit-image', 'POST', formData);
            if (response) {
                console.log('Image uploaded successfully');
            } else {
                console.error('Error uploading image:', response);
                Swal.fire({ title: 'Error uploading image', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
            }
        }
    }

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (!validateEmail(user.email) || !validatePhoneNumber(user.phoneNumber)) {
            console.log('Invalid input');
            Swal.fire({ title: 'Invalid input', icon: 'error', text: 'Please enter a valid email and phone number', customClass: { confirmButton: 'button-alert' } });
            return;
        }

        const response = await apiService('/user/edit-profile', 'POST', user);
        if (response) {
            console.log('Profile updated successfully');
            setIsEditing(false);
        } else {
            console.error('Error updating profile:', response);
            Swal.fire({ title: 'Error updating profile', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    }

    return (
        <MainLayout>
            <div className='profile d-flex align-items-center justify-content-center flex-column w-100 p-0'>
                <div className='profile-container d-flex align-items-center justify-content-center flex-column m-2 p-3'>
                    <div>
                        <h2>{user.username}</h2>
                        <button className='button-clean white mt-3 settings-button' onClick={handleSettingsClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                    <div className='profile-image d-flex align-items-center justify-content-center m-auto overflow-hidden'>
                        {user.profile_image && (
                            <img src={user.profile_image} alt='profile-img' onClick={handleClickImage}/>
                        )}
                        <input type='file' id='file-input' style={{display: 'none'}} onChange={handleEditImage}/>
                    </div>
                    <button className='button-clean white mt-3' onClick={() => setShowProfile(!showProfile)}>
                        {showProfile ? 'Hide': 'Expands'}
                    </button>
                    <div className={`col profile-info ${showProfile ? 'show' : ''}`}>
                        {isEditing ? (
                            <form className='col-12'>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='name' className='col-4 col-form-label'>Name:</label>
                                    <div className='col-8'>
                                        <input type='text' className='form-control' id='name' name='name' value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='username' className='col-4 col-form-label'>Username:</label>
                                    <div className='col-8'>
                                        <input type='text' className='form-control' id='username' value={user.username} readOnly/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='email' className='col-4 col-form-label'>Email:</label>
                                    <div className='col-8'>
                                        <input type='email' className='form-control' id='email' name='email' value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='birthday' className='col-4 col-form-label'>Birthday:</label>
                                    <div className='col-8'>
                                        <input type='date' className='form-control' id='birthday' name='birthday' value={user.birthday} onChange={(e) => setUser({ ...user, birthday: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='phoneNumber' className='col-4 col-form-label'>Phone number:</label>
                                    <div className='col-8'>
                                        <input type='tel' className='form-control' id='phoneNumber' name='phoneNumber' value={user.phoneNumber} onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='gender' className='col-4 col-form-label'>Gender:</label>
                                    <div className='col-8'>
                                        <select id='gender' className='form-control' name='gender' value={user.gender} onChange={(e) => setUser({ ...user, gender: e.target.value })}>
                                            <option value=''>Select Gender</option>
                                            <option value='male'>Male</option>
                                            <option value='female'>Female</option>
                                            <option value='other'>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        ):(
                            <>
                                <p>Name: {user.name} </p>
                                <p>Username: {user.username} </p>
                                <p>Email: {user.email}</p>
                                <p>Birthday: {user.birthday}</p>
                                <p>Phone number: {user.phoneNumber}</p>
                                <p>Gender: {user.gender} </p>
                            </>
                        )}
                    </div>
                    {isEditing ? (
                        <div className='d-flex justify-content-center gap-3 w-100'>
                            <button className={`button-clean button-edit green ${showProfile ? 'show' : ''}`} onClick={handleSaveChanges}>Save changes</button>
                            <button className={`button-clean button-edit red ${showProfile ? 'show' : ''}`} onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    ):(
                        <div className='d-flex justify-content-center gap-3 w-100'>
                            <button className={`button-clean button-edit green ${showProfile ? 'show' : ''}`} onClick={() => setIsEditing(true)}>Edit profile</button>
                            <button className={`button-clean button-edit red ${showProfile ? 'show' : ''}`} onClick={handleLogout}>Log out</button>
                        </div>
                    )}
                </div>
                {!isDesktop && (
                    <>
                        <div className='d-flex justify-content-center flex-shrink-0 w-100 mt-4 mb-1'>
                            <button className='button-large teal w-100' onClick={() => navigate('/forum')}>FORUM</button>
                        </div>
                        <div className='d-flex justify-content-center flex-shrink-0 w-100 mt-2 mb-1'>
                            <button className='button-large blue w-100' onClick={() => navigate('/chat')}>CHAT</button>
                        </div>
                    </>
                )}
            </div>

            {showSettings && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <button className='button-clean white mt-3 ' onClick={handleCloseSettings}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
                                <path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                        <h3>Work schedule settings</h3>

                        {/* Start Time */}
                        <label>Start:</label>
                        <select
                            value={workHours.start}
                            onChange={(e) => setWorkHours({ ...workHours, start: e.target.value })}
                        >
                            {generateTimeOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* End Time */}
                        <label>End:</label>
                        <select
                            value={workHours.end}
                            onChange={(e) => setWorkHours({ ...workHours, end: e.target.value })}
                        >
                            {generateTimeOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Days Off */}
                        <label>Days off:</label>
                        <select multiple value={workHours.daysOff} onChange={(e) => setWorkHours({ ...workHours, daysOff: Array.from(e.target.selectedOptions, option => option.value) })}>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                        </select>
                        <button className='button-clean white mt-3' onClick={handleSaveSettings}>Save</button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default ProfilePage;