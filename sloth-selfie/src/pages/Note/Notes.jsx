import React from 'react';

import PlusSidebarLayout from '../../layouts/PlusSidebarLayout';
import GridNotes from './GridNotes';
import FormNote from './FormNote';
import Note from './Note';

import { NoteProvider } from '../../contexts/NoteContext';
import { TaskProvider } from '../../contexts/TaskContext';


const Notes = ({ openNote }) => {

    return (
        <NoteProvider>
            <TaskProvider>

                {openNote ? (
                    <Note />
                ) : (
                    <PlusSidebarLayout childrenMain={<GridNotes />} childrenSide={<FormNote />} />
                )}
            </TaskProvider>
        </NoteProvider>
    );
};

export default Notes;
