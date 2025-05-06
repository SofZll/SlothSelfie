import React, { createContext, useContext, useState }  from 'react';

const ToolsContext = createContext();

export const ToolsProvider = ({ children }) => {

    const [rooms, setRooms] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);

    const [room, setRoom] = useState({
        _id: '',
        username: '',
        events: [],
    });

    const resetRoom = () => {
        setRoom({
            _id: '',
            username: '',
            events: [],
        });
    }

    const [devices, setDevices] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [device, setDevice] = useState({
        _id: '',
        username: '',
        events: [],
    });

    const resetDevice = () => {
        setDevice({
            _id: '',
            username: '',
            events: [],
        });
    }

    return (
        <ToolsContext.Provider value={{
            rooms, setRooms,
            selectedRooms, setSelectedRooms,
            room, setRoom, resetRoom,
            devices, setDevices,
            selectedDevices, setSelectedDevices,
            device, setDevice, resetDevice
        }}>
            {children}
        </ToolsContext.Provider>
    );

}

export const useTools = () => useContext(ToolsContext);