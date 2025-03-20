import React from 'react';
import { useIsDesktop } from '../utils/utils';

import { X, MoveLeft } from 'lucide-react';

const SelectionCalendarLayout = ({selection, setSelection, setPopUp, children}) => {

    const isDesktop = useIsDesktop();
        
    return (
        <div className="d-flex flex-column w-100 h-100">

            <div className="row d-flex justify-content-between my-3">
                <div className="col fs-5">
                    Add a new {selection}
                </div>

                <div className="col col-auto">
                    {selection !== '...' ? (
                        <button className='btn py-0 m-0' onClick={() => setSelection('...')} alt='back'>
                            <MoveLeft size={25} color='#555B6E' strokeWidth={1.75} />
                        </button>
                    ) : (
                        <>
                            {!isDesktop && (
                                <button className='btn' onClick={() => setPopUp(false)} alt='exit'>
                                    <X size={25} color='#555B6E' strokeWidth={1.75} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <main className="d-flex justify-content-center form-popup">{children}</main>

            

        </div>

    )
}

export default SelectionCalendarLayout;