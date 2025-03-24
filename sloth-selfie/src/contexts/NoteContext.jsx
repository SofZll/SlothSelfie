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
        isTodo: false,
        createDate: new Date(),
        updateDate: new Date(),
        tasks: [],
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
            isTodo: false,
            createDate: new Date(),
            updateDate: new Date(),
            tasks: [],
        });
    }

    const [selected, setSelected] = useState({
        selection: '',
        edit: false,
        add: false,
        popUp: false
    });

    const resetSelected = () => {
        setSelected({
            selection: '',
            edit: false,
            add: false,
            popUp: false
        });
    }

    return (
        <NoteContext.Provider value={{ note, setNote, notes, setNotes, resetNote, selected, setSelected, resetSelected }}>
            {children}
        </NoteContext.Provider>
    );
}

export const useNote = () => useContext(NoteContext);