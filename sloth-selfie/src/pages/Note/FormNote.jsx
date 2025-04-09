import React, { useEffect } from 'react';

import { useNote } from '../../contexts/NoteContext';
import { useIsDesktop } from '../../utils/utils';
import { apiService } from '../../services/apiService';
import ShareInput from '../../components/ShareInput';

import ListTask from './ListTask';

import Swal from 'sweetalert2';

import { X } from 'lucide-react';

const FormNote = () => {

    const { selected, resetSelected, note, setNote, resetNote, notes, setNotes } = useNote();
    const isDesktop = useIsDesktop();

    const handleSubmit = async () => {

        if (!note.title) {
            Swal.fire({ title: 'Warning', icon: 'warning', text: 'Title is required', customClass: { confirmButton: 'button-alert' } });
            return;
        }

        if (!note.content && note.tasks.length === 0) {
            Swal.fire({ title: 'Warning', icon: 'warning', text: 'Content or tasks are required', customClass: { confirmButton: 'button-alert' } });
            return;
        }

        if (selected.add) {
            const response = await apiService('/note', 'POST', note);
            if (response) {
                Swal.fire({ title: 'Note added', icon: 'success', text: 'Note added successfully', customClass: { confirmButton: 'button-alert' } });
                setNotes([...notes, response]);
            } else Swal.fire({ title: 'Error', icon: 'error', text: 'Error adding note', customClass: { confirmButton: 'button-alert' } });
        } else {
            const response = await apiService(`/note/${note._id}`, 'PUT', note);
            if (response) {
                Swal.fire({ title: 'Note edited', icon: 'success', text: 'Note edited successfully', customClass: { confirmButton: 'button-alert' } });
                setNotes(notes.map(n => n._id === note._id ? response : n));

            } else Swal.fire({ title: 'Error', icon: 'error', text: 'Error editing note', customClass: { confirmButton: 'button-alert' } });
        }
        resetNote();
        resetSelected();
        
    }

    const deleteNote = async () => {
        const response = await apiService(`/note/${note._id}`, 'DELETE');
        if (response) {
            Swal.fire({ title: 'Note deleted', icon: 'success', text: 'Note deleted successfully', customClass: { confirmButton: 'button-alert' } });
            setNotes(notes.filter(n => n._id !== note._id));
            resetNote();
            resetSelected();
        } else {
            Swal.fire({ title: 'Error', icon: 'error', text: 'Error deleting note', customClass: { confirmButton: 'button-alert' } });
        }
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
                        onChange={(e) => setNote({...note, ['title']: e.target.value})} />
                    </div>

                    <div className='col-6'>
                        <label htmlFor='category' className='form-label'>Category</label>
                        <select className='form-select' id='category'
                        value={note.category}
                        onChange={(e) => setNote({...note, ['category']: e.target.value})}>
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
                        onChange={(e) => setNote({...note, ['content']: e.target.value})}
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
                        onChange={(e) => setNote({...note, ['noteAccess']: e.target.value})}>
                            <option value='private'>Private</option>
                            <option value='public'>Public</option>
                            <option value='shared'>Shared</option>
                        </select>
                    </div>
                </div>

                {note.noteAccess === 'shared' && (
                    <div className='row py-2'>
                        <div className='col-12'>
                            <label htmlFor='receivers' className='form-label'>Share with</label>
                            <ShareInput receivers={note.sharedWith} setReceivers={(receivers) => setNote({...note, ['sharedWith']: receivers})} />
                        </div>
                    </div>
                )}

                <div className='d-flex align-items-center justify-content-center'>
                    <button type='button' className='btn-main rounded shadow-sm mt-4' onClick={() => handleSubmit()}>{selected.edit ? 'edit' : 'save'}</button>
                    {selected.edit && (
                        <button type='button' className='btn-main rounded shadow-sm mt-4 ms-3' onClick={() => deleteNote()}>delete</button>
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
                        <button className='btn p-0' onClick={() => resetSelected()} alt='exit'>
                            <X size={25} color='#555B6E' strokeWidth={1.75} />
                        </button>
                    }
                    </>
                ) : (
                    <button className='btn p-0' onClick={() => resetSelected()} alt='exit'>
                        <X size={25} color='#555B6E' strokeWidth={1.75} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default FormNote;