import React, { useMemo } from 'react';
import DesktopNav from '../components/DesktopNav'
import MobileNav from '../components/MobileNav'
import Header from '../components/Header'
import { useMediaQuery } from 'react-responsive';

const MainLayout = ({ children }) => {
    const isDesktop = useMemo(() => useMediaQuery({ minWidth: 769 }), []);

    return (
        <div>
            {isDesktop ? (
                <DesktopNav />
            ) : (
                <MobileNav />
            )}
            <Header />
            <main>{children}</main>
        </div>
    );
};

export default MainLayout;
