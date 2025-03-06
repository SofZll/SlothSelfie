import React, { useMemo } from 'react';
import DesktopNav from '../components/DesktopNav'
import MobileNav from '../components/MobileNav'
import Header from '../components/Header'
import { useIsDesktop } from '../utils/utils';

const MainLayout = ({ children }) => {
    const isDesktop = useIsDesktop();

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
