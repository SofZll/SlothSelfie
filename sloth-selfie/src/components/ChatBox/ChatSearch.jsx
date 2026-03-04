import React from 'react';
import { Plus, Undo2 } from 'lucide-react';

import { useChat } from '../../contexts/ChatContext';
import ShareInput from '../ShareInput';

const ChatSearch = () => {
    const { setSearchTerm, handleNewChat, participants, setParticipants, showShareInput, setShowShareInput } = useChat();
    
    return (
        <>
            {!showShareInput ? (
                <div className='d-flex flex-row p-2 gap-1'>
                    <input type='text' className='form-control p-1' placeholder='Cerca' onChange={(e) => setSearchTerm(e.target.value)}/>
                    <button type='button' aria-label='Add' title='Add chat' className='new-chat-button d-flex align-items-center' onClick={() => setShowShareInput (!showShareInput)}><Plus /></button>
                </div>
            ) : (
                <div className='d-flex flex-row p-2'>
                    <ShareInput receivers={participants} setReceivers={setParticipants} />
                    {participants.length > 0 ? <button type='button' aria-label='createChat' className='button-clean green mb-5 ms-2' onClick={() => handleNewChat()}>Create</button> : <button type='button' aria-label='Undo' title='Undo' className='new-chat-button d-flex align-items-start mt-2' onClick={() => setShowShareInput (!showShareInput)}><Undo2 /></button>}
                </div>
            )}
        </>
    )
}

export default ChatSearch;