import React, { createContext, useContext, useState } from "react";

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {

    const [note, setNote] = useState({
        _id: '',
        title: '',
        category: '',
        content: '',
        noteAccess: 'private',
        sharedWith: [],
        createDate: new Date(),
        updateDate: new Date(),
        tasks: [],
    });

    const [notes, setNotes] = useState([]);

    const resetNote = () => {
        setNote({
            _id: '',
            title: '',
            category: '',
            content: '',
            noteAccess: 'private',
            sharedWith: [],
            createDate: new Date(),
            updateDate: new Date(),
            tasks: [],
        });
    }

    const [selected, setSelected] = useState({
        selection: '',
        edit: false,
        add: true,
        popUp: false
    });

    const resetSelected = () => {
        setSelected({
            selection: '',
            edit: false,
            add: true,
            popUp: false
        });
    }

    const [filters, setFilters] = useState({
        order: 'title',
        date: null
    });

    const resetDate = () => {
        setFilters({
            ...filters,
            date: null
        });
    }

    return (
        <NoteContext.Provider value={{ note, setNote, notes, setNotes, resetNote, selected, setSelected, resetSelected, filters, setFilters, resetDate }}>
            {children}
        </NoteContext.Provider>
    );
}

export const useNote = () => useContext(NoteContext);