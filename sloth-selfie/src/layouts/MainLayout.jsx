import React from 'react';
import { useIsDesktop } from '../utils/utils';

import '../css/Menu.css';

import DesktopNav from '../components/DesktopNav'
import MobileNav from '../components/MobileNav'
import Header from '../components/Header'

const MainLayout = ({ children }) => {
    const isDesktop = useIsDesktop();

    return (
        <div className='d-flex h-100 w-100'>
            {isDesktop ? (
                <DesktopNav />
            ) : (
                <MobileNav />
            )}
            <Header />
            <main className='d-flex h-100 w-100 align-items-center justify-content-center'>{children}</main>
        </div>
    );
};

export default MainLayout;
