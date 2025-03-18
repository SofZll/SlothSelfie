import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePhoneNumber } from '../utils/validation';
import MainLayout from '../layouts/MainLayout';
import { apiService } from '../services/apiService';
import { useIsDesktop } from '../utils/utils';
import Swal from 'sweetalert2';
import '../styles/Profile.css';

const ProfilePage = ({ profileData }) => {
    const isDesktop = useIsDesktop();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [currenteProfileData, setcurrenteProfileData] = useState(profileData);

    useEffect(() => {
        console.log(profileData);
    }, [profileData]);

    const handleClickImage = () => {
        document.getElementById('file-input').click();
    }

    const handleEditImage = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setcurrenteProfileData({ ...currenteProfileData, profile_image: reader.result });
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
        if (!validateEmail(currenteProfileData.email) || !validatePhoneNumber(currenteProfileData.phoneNumber)) {
            console.log('Invalid input');
            Swal.fire({ title: 'Invalid input', icon: 'error', text: 'Please enter a valid email and phone number', customClass: { confirmButton: 'button-alert' } });
            return;
        }

        const response = await apiService('/user/edit-profile', 'POST', currenteProfileData);
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

    const handleClickForum = () => {
        navigate('/forum');
    }

    return (
        <MainLayout>
            <div className='container profile'>
                <div className='col profile-container'>
                    <h2>{currenteProfileData.username}</h2>
                    <div className='profile-image'>
                        {currenteProfileData.profile_image && (
                            <img src={currenteProfileData.profile_image} alt='profile-img' onClick={handleClickImage}/>
                        )}
                        <input type='file' id='file-input' style={{display: 'none'}} onChange={handleEditImage}/>
                    </div>
                    <button className='btn button-info' onClick={() => setShowProfile(!showProfile)}>
                        {showProfile ? 'Hide': 'Expands'}
                    </button>
                    <div className={`col profile-info ${showProfile ? 'show' : ''}`}>
                        {isEditing ? (
                            <form className='profile-form col-12'>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='name' className='col-4 col-form-label'>Name:</label>
                                    <div className='col-8'>
                                        <input type='text' className='form-control' id='name' name='name' value={currenteProfileData.name} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, name: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='username' className='col-4 col-form-label'>Username:</label>
                                    <div className='col-8'>
                                        <input type='text' className='form-control' id='username' value={currenteProfileData.username} readOnly/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='email' className='col-4 col-form-label'>Email:</label>
                                    <div className='col-8'>
                                        <input type='email' className='form-control' id='email' name='email' value={currenteProfileData.email} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, email: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='birthday' className='col-4 col-form-label'>Birthday:</label>
                                    <div className='col-8'>
                                        <input type='date' className='form-control' id='birthday' name='birthday' value={currenteProfileData.birthday} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, birthday: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='phoneNumber' className='col-4 col-form-label'>Phone number:</label>
                                    <div className='col-8'>
                                        <input type='tel' className='form-control' id='phoneNumber' name='phoneNumber' value={currenteProfileData.phoneNumber} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, phoneNumber: e.target.value })}/>
                                    </div>
                                </div>
                                <div className='row mb-3 form-group'>
                                    <label htmlFor='gender' className='col-4 col-form-label'>Gender:</label>
                                    <div className='col-8'>
                                        <select id='gender' className='form-control' name='gender' value={currenteProfileData.gender} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, gender: e.target.value })}>
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
                                <p>Name: {profileData.name} </p>
                                <p>Username: {profileData.username} </p>
                                <p>Email: {profileData.email}</p>
                                <p>Birthday: {profileData.birthday}</p>
                                <p>Phone number: {profileData.phoneNumber}</p>
                                <p>Gender: {profileData.gender} </p>
                            </>
                        )}
                    </div>
                    {isEditing ? (
                        <div className='profile-buttons'>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={handleSaveChanges}>Save changes</button>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    ):(
                        <div className='profile-buttons'>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={() => setIsEditing(true)}>Edit profile</button>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={handleLogout}>Log out</button>
                        </div>
                    )}
                </div>
                <div className='mini-forum'>
                    <button className='button-forum' onClick={handleClickForum}>FORUM</button>
                </div>
                {/*!isDesktop && (
                    <NotificationFunction /> 
                )*/}
            </div>
        </MainLayout>
    );
};

export default ProfilePage;