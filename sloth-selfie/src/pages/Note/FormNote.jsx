import React from 'react';

import { useNote } from '../../contexts/NoteContext';
import { useIsDesktop } from '../../utils/utils';

import { X } from 'lucide-react';

const FormNote = () => {

    const { selected, setSelected, resetSelected } = useNote();
    const isDesktop = useIsDesktop();

    return (
        <div className='d-flex flex-column w-100 h-100'>
            

            <div className="row">
                <div className="col fs-5">
                    {selected.add ? 'New note' : 'Note'}
                </div>
            </div>

            {!isDesktop && (
                <button className='btn position-fixed top-0 end-0' onClick={() => resetSelected()} alt='exit'>
                    <X size={25} color='#555B6E' strokeWidth={1.75} />
                </button>
            )}
        </div>
    );
}

export default FormNote;