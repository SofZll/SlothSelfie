import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import '../../styles/ChatBox.css';
import { useChat } from '../../contexts/ChatContext';
import { TimeMachineContext } from '../../contexts/TimeMachineContext';
import MainLayout from '../../layouts/MainLayout';

import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatList from './ChatList';
import ChatSearch from './ChatSearch';

const ChatBox = () => {
    const { chats, selectedChat, setSelectedChat, fetchChat, isDesktop, isOpen, setIsOpen } = useChat();
    const { refreshKey } = useContext(TimeMachineContext);
    const { chatId } = useParams();

    useEffect(() => {
        if (chatId) {
            const matchedChat = chats.find(chat => chat.otherParticipant.username === chatId);
            if (matchedChat) {
                setSelectedChat(matchedChat);
                fetchChat(matchedChat._id);
            }
        }
    }, [chatId, chats, setSelectedChat, refreshKey]);

    const chatContent = (
        <div className={`d-relative flex-column message-container ${isDesktop ? 'desktop' : ''} ${isOpen ? 'open' : ''}`}>
            {isDesktop ? (
                <button type='button' aria-label='Chats' title='Chats' className='pe-auto message-button' onClick={() => setIsOpen(prevState => !prevState)}>
                    <ChatHeader />
                </button>
            ) : (
                <ChatHeader />
            )}
            <div className={`message-box ${isOpen ? 'open' : ''}`}>
                {selectedChat ? (
                    <div className='d-flex h-100 flex-column'>
                        <MessageList />
                        <MessageInput />
                    </div>
                ) : (
                    <div className='h-100 cursor-pointer'>
                        <ChatSearch />
                        <ChatList />
                    </div>
                )}
            </div>
        </div>
    );

    return !isDesktop ? (
        <MainLayout>
            {chatContent}
        </MainLayout>
    ) : (
        chatContent
    );
};

export default ChatBox;