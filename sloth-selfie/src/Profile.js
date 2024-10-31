import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Profile.css";

function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [notifs, setNotifs] = useState([
        {
            id: 1,
            sender: 'John Doe',
            message: 'You have a new follower!',
            date: '2023-10-01',
            read: false
        },
        {
            id: 2,
            sender: 'Jane Doe',
            message: 'Your post received a new like!',
            date: '2023-10-02',
            read: true
        },
        {
            id: 3,
            sender: 'John Doe',
            message: 'You have a new comment on your post!',
            date: '2023-10-03',
            read: false
        },
        {
            id: 4,
            sender: 'John Doe',
            message: 'Your profile was viewed 10 times today!',
            date: '2023-10-04',
            read: true
        },
        {
            id: 5,
            sender: 'John Doe',
            message: 'You have a new message!',
            date: '2023-10-05',
            read: false
        }
    ]);
    
    const [profileData, setProfileData] = useState({
        name: '', 
        username: '', 
        email: '', 
        birthday: '', 
        phoneNumber: '', 
        gender:'', 
        profile_image: ''
    });

    const navigate = useNavigate();

    const bufferToBase64 = (buffer) => {
        const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
        return btoa(binary);
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/user/profile`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success && data.user) {
                    // Since the image is stored a Buffer we need to convert it to base64
                    let base64Image = '';
                    if (data.user.image?.data?.data) {
                        const buffer = data.user.image.data.data;
                        base64Image = `data:${data.user.image.contentType};base64,${bufferToBase64(buffer)}`;
                    }

                    const formattedBirthday = data.user.birthday ? new Date(data.user.birthday).toISOString().split('T')[0] : '';
                    
                    setProfileData({
                        name: data.user.name || '',
                        username: data.user.username || '',
                        email: data.user.email || '',
                        birthday: formattedBirthday,
                        phoneNumber: data.user.phoneNumber || '',
                        gender: data.user.gender || '',
                        profile_image: base64Image
                    });
                    console.log('Profile data:', data.user);
                    console.log(profileData.profile_image)
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, []);

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
                    profile_image: reader.result
                }));
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('image', file);
            formData.append('email', profileData.username);

            try {
                const response = await fetch('http://localhost:8000/api/user/edit-image', {
                    method: 'POST',
                    credentials: 'include',
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
            const response = await fetch('http://localhost:8000/api/user/edit-profile', {
                method: 'POST',
                credentials: 'include',
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
            const response = await fetch('http://localhost:8000/api/user/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify()
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
    
    const handleReadNotif = (notifId) => {
        const notifElement = document.getElementById(`notif-${notifId}`);
        notifElement.classList.add('disappearing');
        setTimeout(() => {
            setNotifs(notifs.map(notif => 
                notif.id === notifId ? { ...notif, read: true } : notif
            ));
        }, 500);
    }

    return (
        <div className="profile">
            <div className="profile-container">
                <h2>{profileData.username}</h2>
                <div className="profile-image">
                    {profileData.profile_image && (
                        <img src={profileData.profile_image} alt="profile-img" onClick={handleImageClick}/>
                    )}
                    <input type="file" id="file-input" style={{display: 'none'}} onChange={editImage}/>
                </div>
                <button className="btn button-info" onClick={toggleShowProfile}>
                    {showProfile ? "Hide": "Expands"}
                </button>
                <div className={`profile-info ${showProfile ? 'show' : ''}`}>
                    {isEditing ? (
                        <form className="profile-form">
                            <div className="form-group profile-form-group">
                                <label htmlFor="name">Name:</label>
                                <input type="text" id="name" name="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="username">Username:</label>
                                <span>{profileData.username}</span>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="email">Email:</label>
                                <input type="email" id="email" name="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="birthday">Birthday:</label>
                                <input type="date" id="birthday" name="birthday" value={profileData.birthday} onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="phoneNumber">Phone number:</label>
                                <input type="tel" id="phoneNumber" name="phoneNumber" value={profileData.phoneNumber} onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}/>
                            </div>
                            <div className="form-group profile-form-group">
                                <label htmlFor="gender">Gender:</label>
                                <select id="gender" name="gender" value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}>
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
            <div className="mini-hub">
                <button className="button-hub" onClick={navigateHub}>HUB</button>
            </div>
            <div className="notifs">
                <h5>Notifications</h5>
                {notifs.map((notif) => (
                    !notif.read && (
                        <div key={notif.id} id={`notif-${notif.id}`} className={`notif ${notif.read ? 'read' : 'unread'}`}>
                            <div className="notif-title">
                                <h6>{notif.sender}</h6>
                                <p>{notif.date}</p>
                            </div>
                            <p>{notif.message}</p>
                            <button className="btn notif-button" onClick={() => handleReadNotif(notif.id)}>Read</button>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default Profile;