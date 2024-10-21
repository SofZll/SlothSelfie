import React, { useState, useEffect, useContext } from "react";
import "./css/Profile.css";

function Profile({ username }) {
    const [profileData, setProfileData] = useState({name: '', username: '', email: '', birthday: '', phoneNumber: '', gender:'', profile_image: ''});

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch('api/profile?username=' + username);
                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [username]);

    const handleImageClick = () => {
        document.getElementById('file-input').click();
    }

    const editImage = (e) => {
    }
    const editProfile = (e) => {
    }

    const logout = async () => {
        try {
            const response = await fetch('api/logout', {
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

    return (
        <div className="profile-container">
            <h2 className="profile-title">Profile</h2>
            <div className="profile-image">
                {profileData.profile_image_url && (
                    <img src={profileData.profile_image_url} alt="image" onClick={handleImageClick}/>
                )}
                <input type="file" id="file-input" style={{display: 'none'}} onChange={editImage}/>
            </div>
            <div className="profile-info">
                <p>Name: {profileData.name} </p>
                <p>Username: {profileData.username} </p>
                <p>Email: {profileData.email}</p>
                <p>Birthday: {profileData.birthday}</p>
                <p>Phone number: {profileData.phoneNumber}</p>
                <p>Gender: {profileData.gender} </p>
            </div>
            <h2 className="profile-title">Pomodoro stats</h2>
            <button className="btn" onClick={editProfile}>Edit profile</button>
            <button className="btn" onClick={logout}>Log out</button>
        </div>
    );
}

export default Profile;