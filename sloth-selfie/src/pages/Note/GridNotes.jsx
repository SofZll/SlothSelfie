import React, { useState, useEffect } from 'react';

import PlusLayout from '../../layouts/PlusLayout';
import FormNote from './FormNote';
import CardNote from '../../components/CardNote';

import { apiService } from '../../services/apiService';
import { useNote } from '../../contexts/NoteContext';

const GridNotes = () => {

    const { selected, setSelected, notes, setNotes, filters, setFilters } = useNote();
    const [filtedNotes, setFilteredNotes] = useState([]);

    const fetchNotes = async () => {
        const response = await apiService('/notes', 'GET');
        if (response) setNotes(response);
    }

    const filterNotes = () => {

        let n = [...notes];
        if (filters.date) n = n.filter(note => new Date(note.createDate).toLocaleDateString() === filters.date);

        switch (filters.order) {
            case 'title':
                n.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'length':
                n.sort((a, b) => a.content.length - b.content.length);
                break;
            case 'most_recent':
                n.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
                break;
            case 'least_recent':
                n.sort((a, b) => new Date(a.createDate) - new Date(b.createDate));
                break;
            default:
                break;
        }

        setFilteredNotes(n);
    }

    useEffect(() => {
        fetchNotes();
    }, []);

    useEffect(() => {
        if (notes.length > 0) filterNotes();
    }, [notes, filters]);


    return (
        <PlusLayout clickCall={() => setSelected({ ...selected, add: true, popUp: true })} selected={selected.popUp} popUp={<FormNote />}>
            
            <div className='row py-2 w-100 mt-md-5'>
                <div className='col-6'>
                    <label htmlFor='filter' className='form-label'>Order by:</label>
                    <select className='form-select'
                    value={filters.order}
                    onChange={(e) => setFilters({ ...filters, order: e.target.value })}>
                        <option value='title'>Title</option>
                        <option value="length">By Length</option>
                        <option value="most_recent">Most Recent</option>
                        <option value="least_recent">Least Recent</option>
                    </select>
                </div>
                
                <div className='col-6'>
                    <label htmlFor='date' className='form-label'>Date:</label>
                    <input type='date' className='form-control'
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
                </div>
            </div>

            <div className='row p-2 d-flex w-100 h-75 overflow-y-auto border rounded shadow m-3'>
                {filtedNotes.length > 0 ? (
                    filtedNotes.map((note, index) => (
                        <div key={index} className='col-12 col-md-6 col-lg-4 my-1'>
                            <CardNote Note={note} />
                        </div>
                    ))
                ) : (
                    <div className='col-12'>
                        <h3>No notes found</h3>
                    </div>
                )}
            </div>
        </PlusLayout>
    );
}

export default GridNotes;