import React, { createContext, useContext, useState } from "react";

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {

    const [note, setNote] = useState({
        _id: '',
        title: '',
        user: '',
        category: '',
        content: '',
        noteAccess: 'private',
        sharedWith: [],
        createDate: new Date(),
        updateDate: new Date(),
        tasks: [],
        addedTasks: [],
        deletedTasks: []
    });

    const [notes, setNotes] = useState([]);

    const resetNote = () => {
        setNote({
            _id: '',
            title: '',
            user: '',
            category: '',
            content: '',
            noteAccess: 'private',
            sharedWith: [],
            createDate: new Date(),
            updateDate: new Date(),
            tasks: [],
            addedTasks: [],
            deletedTasks: []
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
        date: ''
    });

    const [deletePopUp, setDeletePopUp] = useState({
        show: false,
        note: null
    });

    return (
        <NoteContext.Provider value={{ note, setNote, notes, setNotes, resetNote, selected, setSelected, resetSelected, filters, setFilters, deletePopUp, setDeletePopUp }}>
            {children}
        </NoteContext.Provider>
    );
}

export const useNote = () => useContext(NoteContext);