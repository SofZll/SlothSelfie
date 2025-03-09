import React, { useState, useEffect } from 'react';
import { useIsDesktop } from '../utils/utils';

import MainLayout from '../layouts/MainLayout';
import Planner from './Planner';

import { Plus } from 'lucide-react';

const Calendar = () => {

    const isDesktop = useIsDesktop();

    return (
        <MainLayout>
            <div className='d-flex w-100 h-75 position-relative'>

                <div className='d-flex flex-grow-1 p-3 justify-content-center'>
                    <Planner />
                </div>
                
                {isDesktop ? (
                    <div className='d-flex w-25'>
                        
                    </div>
                ) : (
                    <button className='btn-main rounded-circle p-2 position-absolute bottom-0 end-0 mx-3' alt='add'>
                        <Plus size={36} color="#fafafa" strokeWidth={1.75} />
                    </button>
                )}
            </div>
        </MainLayout>
    )
}

export default Calendar;
