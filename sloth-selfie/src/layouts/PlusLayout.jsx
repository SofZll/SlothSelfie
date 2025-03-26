import React from 'react';

import { useIsDesktop } from '../utils/utils';

import { Plus } from 'lucide-react';

const PlusLayout = ({ children, clickCall, selected, popUp }) => {

    const isDesktop = useIsDesktop();

    return (
        <div className='d-flex flex-column w-100 h-100 justify-content-center align-items-center'>

            {!isDesktop && (
                <>
                    <button className='btn-main rounded-circle p-2 position-fixed end-0 mx-3 btn-plus pop-up' alt='add' onClick={() => clickCall()}>
                        <Plus size={36} color='#fafafa' strokeWidth={1.75} />
                    </button>

                    {selected && (
                        <div className='d-flex flex-column w-75 bg-white rounded p-3 position-fixed top-50 start-50 translate-middle pop-up shadow-lg'>
                            {popUp}
                        </div>
                    )}
                </>
            )}

            {children}
        </div>
    )
}

export default PlusLayout;