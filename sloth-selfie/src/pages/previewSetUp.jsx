import React, { useState, useEffect } from "react";
import iconCross from './media/crossDark.svg';
import iconTomato from './media/tomatoDark.svg';
import iconCalendar from './media/calendarDark.svg';
import iconNote from './media/notesDark.svg';
import iconProject from './media/projectsDark.svg';
import './css/setting.css';
import { scaleRotate as Menu} from 'react-burger-menu';

function PreviewSetUp(props) {

    const [isSetting, setIsSetting] = useState('calendar');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isOpen, setIsOpen] = useState(false);

    const handleSetUp = () => {
        props.setSetUp(!props.setUp);
    };

    const handleSetting = (setting) => {
        setIsSetting(setting);
    };

    const handleStateChange = (state) => {
        setIsOpen(state.isOpen);
    };

    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <div id="outer-container" className="d-flex flex-column align-items-center position-relative rounded m-5 p-3">
            <button className="btn " onClick={handleSetUp}>
                <img src={iconCross} alt="cross" className="icon-cross" />
            </button>
            

            {isMobile ? (
                <Menu
                    pageWrapId="page-wrap"
                    outerContainerId="outer-container"
                    isOpen={isOpen}
                    onStateChange={handleStateChange}>
                        <button className={(isSetting === 'calendar' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('calendar')}>
                            <img src={iconCalendar} alt="calendar" className="icon-settings" />
                        </button>
                        <button className={(isSetting === 'note' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('note')}>
                            <img src={iconNote} alt="note" className="icon-settings" />
                        </button>
                        <button className={(isSetting === 'tomato' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('tomato')}>
                            <img src={iconTomato} alt="tomato" className="icon-settings" />
                        </button>
                        <button className={(isSetting === 'project' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('project')}>
                            <img src={iconProject} alt="project" className="icon-settings" />
                        </button>
                </Menu>

            ) : (
                <nav className="nav-settings">
                    <button className={(isSetting === 'calendar' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('calendar')}>
                        <img src={iconCalendar} alt="calendar" className="icon-settings" />
                    </button>
                    <button className={(isSetting === 'note' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('note')}>
                        <img src={iconNote} alt="note" className="icon-settings" />
                    </button>
                    <button className={(isSetting === 'tomato' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('tomato')}>
                        <img src={iconTomato} alt="tomato" className="icon-settings" />
                    </button>
                    <button className={(isSetting === 'project' ? "btn-settings active-btn" : "btn-settings")} onClick={()=>handleSetting('project')}>
                        <img src={iconProject} alt="project" className="icon-settings" />
                    </button>
                </nav>
            )}

            <main id="page-wrap">

                {isSetting === 'calendar' && (
                    <div className="setting-content">
                        <h2>Calendar</h2>
                        <p>Coming soon...</p>
                    </div>
                )}

                {isSetting === 'note' && (
                    <div className="setting-content">
                        <h2>Note</h2>
                        <p>Coming soon...</p>
                    </div>
                )}

                {isSetting === 'tomato' && (
                    <div className="setting-content">
                        <h2>Tomato</h2>
                        <p>Coming soon...</p>
                    </div>
                )}

                {isSetting === 'project' && (
                    <div className="setting-content">
                        <h2>Project</h2>
                        <p>Coming soon...</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PreviewSetUp;
