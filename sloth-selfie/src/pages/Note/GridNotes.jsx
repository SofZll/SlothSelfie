import React from 'react';

import PlusLayout from '../../layouts/PlusLayout';
import FormNote from './FormNote';

import { useNote } from '../../contexts/NoteContext';

const GridNotes = () => {

    const { selected, setSelected } = useNote();

    return (
        <PlusLayout clickCall={() => setSelected({ ...selected, add: true, popUp: true })} selected={selected.popUp} popUp={<FormNote />}>
            <h1>GridNotes</h1>
        </PlusLayout>
    );
}

export default GridNotes;