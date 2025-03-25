import React from 'react';

import PlusSidebarLayout from '../../layouts/PlusSidebarLayout';
import GridNotes from './GridNotes';
import FormNote from './FormNote';

import { NoteProvider } from '../../contexts/NoteContext';
import { TaskProvider } from '../../contexts/TaskContext';


const Note = () => {

    return (
        <NoteProvider>
            <TaskProvider>
                <PlusSidebarLayout childrenMain={<GridNotes />} childrenSide={<FormNote />} />
            </TaskProvider>
        </NoteProvider>
    );
};

export default Note;
