import React, { useState } from 'react';
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
            <div className="profile">
                <div className="profile-container">
                    <h2>{currenteProfileData.username}</h2>
                    <div className="profile-image">
                        {currenteProfileData.profile_image && (
                            <img src={currenteProfileData.profile_image} alt="profile-img" onClick={handleClickImage}/>
                        )}
                        <input type="file" id="file-input" style={{display: 'none'}} onChange={handleEditImage}/>
                    </div>
                    <button className="btn button-info" onClick={() => setShowProfile(!showProfile)}>
                        {showProfile ? "Hide": "Expands"}
                    </button>
                    <div className={`profile-info ${showProfile ? 'show' : ''}`}>
                        {isEditing ? (
                            <form className="profile-form">
                                <div className="form-group profile-form-group">
                                    <label htmlFor="name">Name:</label>
                                    <input type="text" id="name" name="name" value={currenteProfileData.name} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, name: e.target.value })}/>
                                </div>
                                <div className="form-group profile-form-group">
                                    <label htmlFor="username">Username:</label>
                                    <input type="text" id="username" value={currenteProfileData.username} readOnly/>
                                </div>
                                <div className="form-group profile-form-group">
                                    <label htmlFor="email">Email:</label>
                                    <input type="email" id="email" name="email" value={currenteProfileData.email} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, email: e.target.value })}/>
                                </div>
                                <div className="form-group profile-form-group">
                                    <label htmlFor="birthday">Birthday:</label>
                                    <input type="date" id="birthday" name="birthday" value={currenteProfileData.birthday} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, birthday: e.target.value })}/>
                                </div>
                                <div className="form-group profile-form-group">
                                    <label htmlFor="phoneNumber">Phone number:</label>
                                    <input type="tel" id="phoneNumber" name="phoneNumber" value={currenteProfileData.phoneNumber} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, phoneNumber: e.target.value })}/>
                                </div>
                                <div className="form-group profile-form-group">
                                    <label htmlFor="gender">Gender:</label>
                                    <select id="gender" name="gender" value={currenteProfileData.gender} onChange={(e) => setcurrenteProfileData({ ...currenteProfileData, gender: e.target.value })}>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
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
                        <>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={handleSaveChanges}>Save changes</button>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={() => setIsEditing(false)}>Cancel</button>
                        </>
                    ):(
                        <>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={() => setIsEditing(true)}>Edit profile</button>
                            <button className={`btn btn-main button-edit ${showProfile ? 'show' : ''}`} onClick={handleLogout}>Log out</button>
                        </>
                    )}
                </div>
                <div className="mini-forum">
                    <button className="button-forum" onClick={handleClickForum}>FORUM</button>
                </div>
                {/*!isDesktop && (
                    <NotificationFunction /> 
                )*/}
            </div>
        </MainLayout>
    );
};

export default ProfilePage;