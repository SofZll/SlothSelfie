import React, { useEffect, useContext } from "react";
import "./css/Profile.css";
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from "./StyleContext";

function Profile({ username, email}) {
    const { updateStyles, updateIcon } = useContext(StyleContext);

    useEffect(() => {
        updateStyles(true);
        updateIcon(iconDark);

        return () => {
            updateStyles(false);
            updateIcon(iconLight);
        };
    }, [updateIcon, updateStyles]);

    return (
        <div className="profile-container">
            <h2>Profile</h2>
            <div className="profile-image"></div>
            <div className="profile-info">
                <p>Username: {username} </p>
                <p>Email: {email}</p>
            </div>
            <h2>Pomodoro stats</h2>
            <div className="profile-pomodoro-stats">
            </div>
            <button className="btn" onClick="">Log out</button>
        </div>
    );
}

export default Profile;