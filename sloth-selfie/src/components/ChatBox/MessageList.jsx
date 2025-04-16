import React, { useEffect, useRef, useContext } from 'react';

import { useChat } from '../../contexts/ChatContext';
import { AuthContext } from '../../contexts/AuthContext';

const MessageList = () => {
    const { selectedChat } = useChat();
    const { user } = useContext(AuthContext);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (selectedChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChat]);
    
    return (
        <div className='d-flex flex-column overflow-y-auto p-1 chat-selected-messages'>
            {selectedChat.messages?.length > 0 ? (
                <>
                    {selectedChat.messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender.username === user.username ? 'sent' : 'received'}`}>
                            <p>{message.content.text}</p>
                            <span>{message.createdAt}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                </>
            ) : (
                <div className='no-messages-placeholder'>
                    <p>Nessun messaggio</p>
                </div>
            )}
        </div>
    )
}

export default MessageList;