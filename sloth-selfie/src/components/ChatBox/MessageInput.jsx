import React, { useContext } from 'react';
import socket from '../../services/socket/socket';
import Swal from 'sweetalert2';

import { useChat } from '../../contexts/ChatContext';
import { AuthContext } from '../../contexts/AuthContext';

const MessageInput = () => {
    const { selectedChat, newMessage, setNewMessage } = useChat();
    const { user } = useContext(AuthContext);

    const handleSendMessage = () => {
        if (!newMessage.trim()) {
            Swal.fire({ icon: 'error', title: 'Errore', text: 'Inserisci un messaggio' });
        } else {
            const message = {
                chat: {
                    _id: selectedChat._id,
                },
                sender: {
                    _id: user._id,
                    username: user.username,
                },
                content: {
                    text: newMessage,
                }
            };
            console.log('message:', message);
            socket.emit('send-message', {
                ...message,
            });
            setNewMessage('');
        }
    }

    return (
        <div className='d-flex gap-2 p-2 chat-input'>
            <input type='text' className='form-control p-2' placeholder='Scrivi un messaggio' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <button className='chat-input-button' onClick={handleSendMessage}>Invia</button>
        </div>
    )
}

export default MessageInput;