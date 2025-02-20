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

const Menu = ({ profileData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [isHomeActive, setIsHomeActive] = useState(location.pathname === "/" || location.pathname === "/home" || location.pathname === "/login");

    const handleStateChange = (state) => {
        setIsOpen(state.isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

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
                <Link to="/notifications" onClick={closeMenu}>Notifications</Link>
                <a href="/projects.html" onClick={closeMenu}>Projects</a>
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
                <NavLink to="/profile" activeClassName="active">
                    <img src={iconUser} alt="Profile" />
                </NavLink>
                <a href="/projects.html">
                    <img src={iconProject} alt="Projects" />
                </a>
            </nav>
        </>
    );
};

export default Menu;