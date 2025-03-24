import React from 'react';

import MainLayout from '../../layouts/MainLayout';
import GridNotes from './GridNotes';

import { useIsDesktop } from '../../utils/utils';
import { NoteProvider } from '../../contexts/NoteContext';


const Note = () => {

    const isDesktop = useIsDesktop();

    return (
        <NoteProvider>
            <MainLayout>
                <div className='row'>
                    <div className='col col-md-9 col-12'>
                        <GridNotes />
                    </div>
                    {isDesktop && (
                        <div className='col col-3 col-12'>
                            <h1>SideBar</h1>
                        </div>
                    )}
                </div>
                
            </MainLayout>
        </NoteProvider>
    );
};

export default Note;
