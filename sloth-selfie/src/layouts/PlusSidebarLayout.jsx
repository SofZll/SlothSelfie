import React from 'react';

import MainLayout from './MainLayout';

import { useIsDesktop } from '../utils/utils';

const PlusSidebarLayout = ({ childrenMain, childrenSide }) => {

    const isDesktop = useIsDesktop();

    return (
        <MainLayout>
            <div className='d-flex w-100 h-100'>
                <div className='d-flex flex-column flex-grow-1 planner overflow-hidden'>
                    {childrenMain}
                </div>

                {isDesktop && (
                    <div className='d-flex w-25'>
                        {childrenSide}
                    </div>
                )}
            </div>
        </MainLayout>
    )
}

export default PlusSidebarLayout;