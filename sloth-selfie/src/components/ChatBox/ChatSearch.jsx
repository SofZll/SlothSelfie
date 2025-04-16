import React, { useState } from 'react';
import { Plus, Undo2 } from 'lucide-react';
import Swal from 'sweetalert2';

import { apiService } from '../../services/apiService';
import { useChat } from '../../contexts/ChatContext';
import ShareInput from '../ShareInput';

const ChatSearch = () => {
    const { fetchChats, setSearchTerm } = useChat();
    const [showShareInput, setShowShareInput] = useState(false);
    const [participants, setParticipants] = useState([]);

    const handleNewChat = async () => {
        const response = await apiService('/chat/', 'POST', {username2: participants[0] });
        if (response) {
            console.log('Chat created');
            fetchChats();
            setShowShareInput(false);
        } else {
            console.error('Error creating chat:', response);
            Swal.fire({ icon: 'error', title: 'Errore', text: response.message });
        }
    }

    return (
        <>
            {!showShareInput ? (
                <div className='d-flex flex-row p-2 gap-1'>
                    <input type='text' className='form-control p-1' placeholder='Cerca' onChange={(e) => setSearchTerm(e.target.value)}/>
                    <button className='new-chat-button d-flex align-items-center' onClick={() => setShowShareInput (!showShareInput)}><Plus /></button>
                </div>
            ) : (
                <div className='d-flex flex-row'>
                    <ShareInput receivers={participants} setReceivers={setParticipants} />
                    {participants.length > 0 ? <button className='button-clean green my-2 ' onClick={handleNewChat}>Create</button> : <button className='new-chat-button d-flex align-items-start mt-3' onClick={() => setShowShareInput (!showShareInput)}><Undo2 /></button>}
                </div>
            )}
        </>
    )
}

export default ChatSearch;