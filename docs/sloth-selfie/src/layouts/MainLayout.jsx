import React, { useContext } from 'react';

import { useIsDesktop } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Menu.css';

import DesktopNav from '../components/DesktopNav'
import MobileNav from '../components/MobileNav'
import Header from '../components/Header'
import TimeMachineButton from '../components/TimeMachine/TimeMachineButton';
import ChatBox from '../components/ChatBox/ChatBox';
import NotificationButton from '../components/NotificationButton';
import Settings from '../components/Settings'
import LogoutButton from '../components/LogoutButton';

const MainLayout = ({ children }) => {
    const isDesktop = useIsDesktop();
    const { user } = useContext(AuthContext);


    return (
        <div className='d-flex h-100 w-100 align-items-center justify-content-center overflow-hidden'>
            {!user.isAdmin && (
                <>
                    {isDesktop ? (
                        <>
                            <DesktopNav />
                            <ChatBox />
                        </>
                    ) : (
                        <>
                            <NotificationButton />
                            <MobileNav />
                        </>
                    )}
                </>
            )}
            
            <Header />
            
            {!user.isAdmin ? (
                <>
                    <TimeMachineButton />
                    <Settings />
                </>
            ) : (
                <LogoutButton />
            )}

            <main className='d-flex h-100 w-100 align-items-center justify-content-center'>{children}</main>

        </div>
    );
};

export default MainLayout;
