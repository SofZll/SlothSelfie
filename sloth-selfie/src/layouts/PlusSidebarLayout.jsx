import React from 'react';

import MainLayout from './MainLayout';

import { useIsDesktop } from '../utils/utils';

const PlusSidebarLayout = ({ childrenMain, childrenSide }) => {

    const isDesktop = useIsDesktop();

    return (
        <MainLayout>
            <div className='d-flex w-100 h-100 overflow-hidden justify-content-center align-items-center'>
                <div className='col planner overflow-hidden'>
                    {childrenMain}
                </div>

                {isDesktop && (
                    <div className='col col-lg-3 col-4 ps-0 pe-3 w-100 div-add'>
                        {childrenSide}
                    </div>
                )}
            </div>
        </MainLayout>
    )
}

export default PlusSidebarLayout;