import React from 'react';

import { useIsDesktop } from '../utils/utils';
import '../styles/Menu.css';

import DesktopNav from '../components/DesktopNav'
import MobileNav from '../components/MobileNav'
import Header from '../components/Header'
import TimeMachineButton from '../components/TimeMachine/TimeMachineButton';
import { TimeMachineProvider } from '../contexts/TimeMachineContext';
import { ChatProvider } from '../contexts/ChatContext';
import ChatBox from '../components/ChatBox/ChatBox';

const MainLayout = ({ children }) => {
    const isDesktop = useIsDesktop();

    return (
        <div className='d-flex h-100 w-100 align-items-center justify-content-center overflow-hidden'>
            {isDesktop ? (
                <>
                    <DesktopNav />
                    <ChatProvider >
                        <ChatBox />
                    </ChatProvider>
                </>
            ) : (
                <MobileNav />
            )}
            <Header />
            <TimeMachineProvider>
                <TimeMachineButton />
            </TimeMachineProvider>
            <main className='d-flex h-100 w-100 align-items-center justify-content-center'>{children}</main>
        </div>
    );
};

export default MainLayout;
