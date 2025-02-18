import React, { useState, useEffect } from 'react';
import { slide as Hamburger } from 'react-burger-menu';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './css/Menu.css';
import iconDark from './media/SlothDark.svg';
import iconHome from './media/home.svg';
import iconUser from './media/user.svg';
import iconCalendar from './media/calendarDark.svg';
import iconTomato from './media/tomatoDark.svg';
import iconNote from './media/notesDark.svg';
import iconProject from './media/projectsDark.svg';
import { StyleContext } from './StyleContext';

const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [isHomeActive, setIsHomeActive] = useState(location.pathname === "/" || location.pathname === "/home" || location.pathname === "/login");
    const [profileData, setProfileData] = useState({
        username: '',
        profile_image: ''
    });

    const handleStateChange = (state) => {
        setIsOpen(state.isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    // Since the image is stored a Buffer we need to convert it to base64
    let base64Image = '';
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
                    if (data.user.image?.data?.data) {
                        const buffer = data.user.image.data.data;
                        base64Image = `data:${data.user.image.contentType};base64,${bufferToBase64(buffer)}`;
                    }

                    setProfileData({
                        username: data.user.username || '',
                        profile_image: base64Image
                    });

                    console.log('Profile data:', data.user);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, []); 

    useEffect(() => {
        setIsHomeActive(location.pathname === "/" || location.pathname === "/home" || location.pathname === "/login");
        
    }, [location]);

    return (
        <>
            <Hamburger isOpen={isOpen} onStateChange={handleStateChange}>
                <Link to="/home" onClick={closeMenu}>Home</Link>
                <Link to="/calendar" onClick={closeMenu}>Calendar</Link>
                <Link to="/notes" onClick={closeMenu}>Notes</Link>
                <Link to="/pomodoro" onClick={closeMenu}>Pomodoro</Link>
                <Link to="/projects" onClick={closeMenu}>Projects</Link>
                <Link to="/notifications" onClick={closeMenu}>Notifications</Link>
                <div className="menu-profile">
                    <div className="menu-profile-link">
                        {profileData.profile_image && (
                            <div className="img-wrap">
                                <img src={profileData.profile_image} alt="img-profile"/>
                            </div>
                        )}
                        <div className="menu-profile-info">
                            <span className="menu-profile-username">{profileData.username}</span>
                            <Link to="/profile" onClick={closeMenu}>
                                <span className="menu-profile-small">Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>
                {/*<Link to="/projects">Projects</Link>*/}
            </Hamburger>
            <StyleContext.Consumer>
                {({ icon }) => (
                    <style>
                        {`
                            .bm-burger-bars {
                                background-color: ${icon === iconDark ? '#222D52' : '#FAF9F9'};
                            }
                        `}
                    </style>
                )}
            </StyleContext.Consumer>
            <nav className="mobile-nav">
                <NavLink to="/home"  className={(isHomeActive ? "active" : "")} >
                    <img src={iconHome} alt="Home" />
                </NavLink>
                <NavLink to="/calendar" activeClassName="active">
                    <img src={iconCalendar} alt="Calendar" />
                </NavLink>
                <NavLink to="/notes" activeClassName="active">
                    <img src={iconNote} alt="Notes" />
                </NavLink>
                <NavLink to="/pomodoro" activeClassName="active">
                    <img src={iconTomato} alt="Pomodoro" />
                </NavLink>
                <NavLink to="/projects" activeClassName="active">
                    <img src={iconProject} alt="Projects" />
                </NavLink>
                <NavLink to="/profile" activeClassName="active">
                    <img src={iconUser} alt="Profile" />
                </NavLink>
            </nav>
        </>
    );
};

export default Menu;