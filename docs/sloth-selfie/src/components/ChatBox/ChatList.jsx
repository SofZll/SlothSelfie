import React, { useMemo , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useChat } from '../../contexts/ChatContext';

const ChatList = () => {
    const navigate = useNavigate();
    const { chats, selectedChat, onlineUsers, searchTerm, isDesktop, fetchChat } = useChat();

    const filteredChats = useMemo(() => {
        return chats.filter(chat => 
            chat.otherParticipant.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [chats, searchTerm]);

    const handleChatClick = async (chatId) => fetchChat(chatId);

    useEffect(() => {
        if (!isDesktop && selectedChat) {
            navigate(`/chat/${selectedChat.otherParticipant.username}`);
        }
    }, [selectedChat, isDesktop, navigate]);

    return (
        <>
            {filteredChats && filteredChats.length > 0 ? (
                filteredChats.map((chat, index) => (
                    <div key={index} className='mx-1 px-3 py-2 chat' onClick={() => handleChatClick(chat._id)}>
                        <div className='d-flex align-items-center flex-row chat-container'>
                            <div className='d-flex align-items-center position-relative'>
                                <img src={chat.otherParticipant.image} alt='profile' className='rounded-circle me-2'/>
                                {onlineUsers[chat.otherParticipant._id] && (
                                    <div className="d-inline-block position-absolute bottom-0 online-status online-status online-status-big"></div>
                                )}
                            </div>
                            <div className='d-flex w-100 flex-column align-items-start chat-content'>
                                <div className='d-flex w-100 align-items-center flex-row justify-content-between'>
                                    <div className='d-flex align-items-center gap-2'>
                                        <span className='chat-username'>{chat.otherParticipant.username}</span>
                                        {chat.unreadCount > 0 && <span className='chat-unread-count'>{chat.unreadCount}</span>}
                                    </div>
                                    {chat.lastMessage ? <span className='chat-date'>{chat.lastMessage.createdAt}</span> : <span className='chat-date'>{chat.createdAt}</span>}
                                </div>
                                {chat.lastMessage ? <p>{chat.lastMessage.content.text}</p> : <p>New chat</p> }
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className='no-messages-placeholder'>
                    <p>Nessuna chat</p>
                </div>
            )}
        </>
    )
}

export default ChatList;