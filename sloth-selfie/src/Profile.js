import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Profile.css";

function Profile({ username }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'Giorgio', 
        username: 'Kevin', 
        email: 'giorgio787@example.com', 
        birthday: '22/07/1998', 
        phoneNumber: '', 
        gender:'Male', 
        profile_image: ''
    });
    /*
    const [profileData, setProfileData] = useState({
        name: '', 
        username: '', 
        email: '', 
        birthday: '', 
        phoneNumber: '', 
        gender:'', 
        profile_image: ''
    });
    */

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`/api/user/profile/${username}`);
                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [username]);

    const toggleShowProfile = () => {
        setShowProfile(!showProfile);
    };

    const handleImageClick = () => {
        document.getElementById('file-input').click();
    }

    const editImage = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prevData => ({
                    ...prevData,
                    profile_image_url: reader.result
                }));
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('image', file);
            formData.append('email', profileData.username);

            try {
                const response = await fetch('api/user/edit-image', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Image uploaded successfully:', data);
                } else {
                    console.error('Error uploading image:', response.statusText);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
            
        }
    }

    const editProfile = () => {
        setIsEditing(true);
    } 
    
    const cancelEdit = () => {
        setIsEditing(false);
    };

    const saveChanges = async (e) => {
        const newProfileData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            birthday: document.getElementById('birthday').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            gender: document.getElementById('gender').value,
        };

        try {
            const response = await fetch('api/user/edit-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProfileData)
            });

            if (response.ok) {
                setIsEditing(false);
            } else {
                console.error('Error editing profile:', response.statusText);
            }
        } catch (error) {
            console.error('Error editing profile:', error);
        }
    }

    const logout = async () => {
        try {
            const response = await fetch('api/user/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username: username})
            });

            if (response.ok) {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }   
    }

    const navigateHub = () => {
        navigate('/hub');
    }

    return (
        <>
            <div className="profile-container">
                <h2>{profileData.username}</h2>
                <div className="profile-image">
                    {/*
                    {profileData.profile_image_url && (
                        <img src={profileData.profile_image_url} alt="profile-img" onClick={handleImageClick}/>
                    )}
                    
                    */}
                    <img src='./media/user.svg' alt="profile-img" onClick={handleImageClick}/>
                    <input type="file" id="file-input" style={{display: 'none'}} onChange={editImage}/>
                </div>
                <button className="btn button-info" onClick={toggleShowProfile}>
                    {showProfile ? "Hide": "Expands"}
                </button>
                {/*<button className="btn" onClick={handleImageClick}>Change Photo</button>*/}
                <div className={`profile-info ${showProfile ? 'show' : ''}`}>
                    {isEditing ? (
                        <form className="profile-form">
                            <div className="form-group profile-form-group">
                                <label htmlFor="name">Name:</label>
                                <input type="text" id="name" name="name" value={profileData.name}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="username">Username:</label>
                                <span>{profileData.username}</span>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="email">Email:</label>
                                <input type="email" id="email" name="email" value={profileData.email}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="birthday">Birthday:</label>
                                <input type="date" id="birthday" name="birthday" value={profileData.birthday}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="phoneNumber">Phone number:</label>
                                <input type="tel" id="phoneNumber" name="phoneNumber" value={profileData.phoneNumber}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="gender">Gender:</label>
                                <select id="gender" name="gender" value={profileData.gender}>
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
                        <button className={`btn button-edit ${showProfile ? 'show' : ''}`} onClick={saveChanges}>Save changes</button>
                        <button className={`btn button-edit ${showProfile ? 'show' : ''}`} onClick={cancelEdit}>Cancel</button>
                    </>
                ):(
                    <>
                        <button className={`btn button-edit ${showProfile ? 'show' : ''}`} onClick={editProfile}>Edit profile</button>
                        <button className={`btn button-edit ${showProfile ? 'show' : ''}`} onClick={logout}>Log out</button>
                    </>
                )}
            </div>
            <div className="miniHub">
                <button className="button-hub" onClick={navigateHub}>Go to hub!</button>
            </div>
        </>
    );
}

export default Profile;