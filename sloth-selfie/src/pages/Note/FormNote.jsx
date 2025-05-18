import React, { useEffect } from 'react';

import { useNote } from '../../contexts/NoteContext';
import { useIsDesktop } from '../../utils/utils';
import { apiService } from '../../services/apiService';
import ShareInput from '../../components/ShareInput';

import ListTask from './ListTask';

import { NewSwal } from '../../utils/swalUtils';

import { X } from 'lucide-react';

const FormNote = () => {

    const { selected, resetSelected, note, setNote, resetNote, notes, setNotes, setDeletePopUp } = useNote();
    const isDesktop = useIsDesktop();

    const handleSubmit = async () => {

        if (!note.title) {
            NewSwal.fire({ title: 'Warning', icon: 'warning', text: 'Title is required'});
            return;
        }

        if (!note.content && note.tasks.length === 0) {
            NewSwal.fire({ title: 'Warning', icon: 'warning', text: 'Content or tasks are required'});
            return;
        }

        const response = await apiService(`/note${selected.add ? '' : '/'+note._id}`, selected.add ? 'POST' : 'PUT', note );
        if (!response.success) NewSwal.fire({ title: 'Error', icon: 'error', text: 'Error saving note'});
        else {
            if (selected.edit) setNotes(notes.map(n => n._id === note._id ? response.note : n));
            else setNotes([...notes, response.note]);
            NewSwal.fire({ title: 'Success', icon: 'success', text: selected.edit ? 'Note updated successfully' : 'Note added successfully'});
        }
        
        resetNote();
        resetSelected();
        
    }

    const openDeletePopUp = () => {
        resetSelected();
        setDeletePopUp({show: true, note: note});
    }

    useEffect(() => {
        if (!selected.edit) {
            resetNote();
        }
    }, [selected]);

    return (
        <div className='d-flex flex-column w-100 h-100 p-md-2 p-0 position-relative overflow-hidden'>
            
            <div className='d-flex flex-column w-100 pt-5 overflow-y-auto overflow-x-hidden'>
                <div className='row py-2 '>
                    <div className='col-6'>
                        <label htmlFor='title' className='form-label'>Title</label>
                        <input type='text' className='form-control' id='title'
                        placeholder='Note title'
                        value={note.title}
                        onChange={(e) => setNote({...note, title: e.target.value})} />
                    </div>

                    <div className='col-6'>
                        <label htmlFor='category' className='form-label'>Category</label>
                        <select className='form-select' id='category'
                        value={note.category}
                        onChange={(e) => setNote({...note, category: e.target.value})}>
                            <option value=''>Select category</option>
                            <option value='personal'>Personal</option>
                            <option value='work'>Work</option>
                            <option value='study'>Study</option>
                            <option value='other'>Other</option>
                        </select>
                    </div>
                </div>

                <div className='row py-2'>
                    <div className='col-12'>
                        <label htmlFor='textarea' className='form-label'>Content</label>
                        <textarea className='form-control' id='textarea'
                        placeholder='Type here the note content'
                        value={note.content}
                        onChange={(e) => setNote({...note, content: e.target.value})}
                        required />
                    </div>
                </div>

                <div className='row'>
                    <div className='col-12'>
                        <div>Tasks</div>
                        <ListTask />
                    </div>
                </div>

                <div className='row py-2'>
                    <div className='col-10'>
                        <label htmlFor='noteAccess' className='form-label'>Note access</label>
                        <select className='form-select' id='noteAccess'
                        value={note.noteAccess}
                        onChange={(e) => setNote({...note, noteAccess: e.target.value})}>
                            <option value='private'>Private</option>
                            <option value='public'>Public</option>
                            <option value='shared'>Shared</option>
                        </select>
                    </div>
                </div>

                {note.noteAccess === 'shared' && (
                    <div className='row py-2'>
                        <div className='col-12 mb-3'>
                            <label htmlFor='receivers' className='form-label'>Share with</label>
                            <ShareInput receivers={note.sharedWith} setReceivers={(receivers) => setNote({...note, sharedWith: receivers})} />
                        </div>
                    </div>
                )}

                <div className='d-flex align-items-center justify-content-center'>
                    <button type='button' aria-label='save or edit' className='btn-main rounded shadow-sm mt-4' onClick={() => handleSubmit()}>{selected.edit ? 'edit' : 'save'}</button>
                    {selected.edit && (
                        <button type='button' aria-label='delete' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => openDeletePopUp()}>delete</button>
                    )}
                </div>

            </div>


            <div className='d-flex w-100 position-absolute top-0 start-0'>
                <div className='d-flex fs-5 fw-bold flex-grow-1 align-items-center p-0 py-md-3'>
                    {selected.add ? 'Add a new note' : 'Edit the selected note'}
                </div>

                {isDesktop ? (
                    <>
                    {selected.edit && 
                        <button type='button' aria-label='Close' title='Close' className='btn p-0' onClick={() => resetSelected()}>
                            <X size={25} color='#555B6E' strokeWidth={1.75} />
                        </button>
                    }
                    </>
                ) : (
                    <button type='button' aria-label='Close' title='Close' className='btn p-0' onClick={() => resetSelected()}>
                        <X size={25} color='#555B6E' strokeWidth={1.75} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default FormNote;