import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import { useIsDesktop } from '../utils/utils';
import Swal from 'sweetalert2';

import { validateEmail, validatePhoneNumber } from '../utils/validation';
import MainLayout from '../layouts/MainLayout';
import { apiService } from '../services/apiService';
import { AuthContext } from '../contexts/AuthContext';
import SettingsButton from '../components/SettingsButton';

const ProfilePage = () => {
    const { user, setUser  } = useContext(AuthContext);

    const isDesktop = useIsDesktop();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        console.log(user);
    }, [user]);

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
            if (response.success) {
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
        if (response.success) {
            console.log('Profile updated successfully');
            setIsEditing(false);
        } else {
            console.error('Error updating profile:', response);
            Swal.fire({ title: 'Error updating profile', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        }
    }

    const handleLogout = async () => {
        const response = await apiService('/user/logout', 'POST');
        if (response.success) {
            setUser(null);
        } else {
            console.error('Error logging out:', response);
            Swal.fire({ title: 'Error logging out', icon: 'error', text: response.message, customClass: { confirmButton: 'button-alert' } });
        }
        navigate('/login');
    }

    return (
        <MainLayout>
            <div className='profile d-flex align-items-center justify-content-center flex-column w-100 p-0'>
                <div className='profile-container d-flex align-items-center justify-content-center flex-column m-2 p-3'>
                    <div>
                        <h2>{user.username}</h2>
                        <SettingsButton color='dark' />
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
        </MainLayout>
    );
};

export default ProfilePage;