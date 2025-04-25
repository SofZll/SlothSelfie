import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import '../../styles/ChatBox.css';
import socket from '../../services/socket/socket';
import { AuthContext } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import MainLayout from '../../layouts/MainLayout';

import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatList from './ChatList';
import ChatSearch from './ChatSearch';

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { chats, setChats, selectedChat, setSelectedChat, setOnlineUsers, fetchChats, isDesktop } = useChat();
    const { chatId } = useParams();

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (chatId) {
            const matchedChat = chats.find(chat => chat.otherParticipant.username === chatId);
            if (matchedChat) {
                setSelectedChat(matchedChat);
            }
        }
    }, [chatId, chats, setSelectedChat]);

    useEffect(() => {
        if (!user?._id) return;
        
        const handleStatusChange = ({ userId, isOnline }) => {
            setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
        };

        const handleReceiveMessage = (message) => {
            if (selectedChat?._id === message.chat._id) {
                setSelectedChat((prevChat) => {
                    const updatedMessages = [...prevChat.messages, {
                        ...message,
                        createdAt: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '',
                    }];
                    console.log('Updated messages:', updatedMessages);
                    updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    return { ...prevChat, messages: updatedMessages };
                });
            } else {
                setChats((prevChats) => {
                    const updatedChats = prevChats.map((chat) => {
                        if (chat._id === message.chat._id) {
                            return {
                                ...chat,
                                unreadCount: chat.unreadCount ? chat.unreadCount + 1 : 1,
                            };
                        }
                        return chat;
                    });
                    return updatedChats;
                });
            }
            setChats((prevChats) => {
                let found = false;
                const updatedChats = prevChats.map((chat) => {
                    if (chat._id === message.chat._id) {
                        found = true;
                        return {
                            ...chat,
                            lastMessage: {
                                ...message,
                                createdAt: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '',
                            },
                        };
                    }
                    return chat;
                });
                
                if (!found) {
                    const newChat = {
                        _id: message.chat._id,
                        otherParticipant: message.sender,
                        lastMessage: {
                            ...message,
                            createdAt: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '',
                        },
                        createdAt: message.createdAt,
                    };
                    updatedChats.push(newChat);
                }
        
                return updatedChats;
            });
        };

        socket.on('status-change', handleStatusChange);
        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('status-change');
            socket.off('receive-message');
        };
    }, [user?._id, selectedChat?._id, setChats, setOnlineUsers]);

    const chatContent = (
        <div className={`d-relative flex-column message-container ${isDesktop ? 'desktop' : ''} `}>
            {isDesktop ? (
                <button className='pe-auto message-button' onClick={() => setIsOpen(prevState => !prevState)}>
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