import React, { useState, createContext, useContext, useEffect } from 'react';

import { apiService } from '../services/apiService';
import { useIsDesktop, bufferToBase64 } from '../utils/utils';
import { AuthContext } from './AuthContext';
import { TimeMachineContext } from './TimeMachineContext';
import { NewSwal } from '../utils/swalUtils';

import socket from '../services/socket/socket';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const { refreshKey } = useContext(TimeMachineContext);
    const isDesktop = useIsDesktop();
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const fetchChats = async () => {
        const response = await apiService('/chat', 'GET');
        if (response.success) {
            let base64Image = '';
            const transformedData = response.chats.map(chat => {
                const otherParticipant = chat.participants.find(p => p._id !== user._id);
    
                if (otherParticipant?.image?.data?.data) {
                    base64Image = `data:${otherParticipant.image.contentType};base64,${bufferToBase64(otherParticipant.image.data.data)}`;
                }
    
                const transformedChat = {
                    ...chat,
                    otherParticipant: {
                        ...otherParticipant,
                        image: base64Image,
                    },
                    createdAt: chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : '',
                };
    
                if (chat.lastMessage) {
                    transformedChat.lastMessage = {
                        ...chat.lastMessage,
                        createdAt: chat.lastMessage.createdAt ? new Date(chat.lastMessage.createdAt).toLocaleDateString() : '',
                    };
                }
    
                return transformedChat;
            });

            setChats(transformedData)

            //get status of users
            const onlineUsers = {};
            await Promise.all(transformedData.map(async (chat) => {
                const response2 = await apiService(`/user/profile/${chat.otherParticipant._id}`);
                if (response2.success) {
                    onlineUsers[chat.otherParticipant._id] = response2.user.isOnline;
                } else {
                    console.error('Error fetching user status:', response2);
                }
            }));

            setOnlineUsers(onlineUsers);
        } else {
            console.error('Error fetching chats:', response);
        }
    }

    const fetchChat = async (chatId) => {
        const response = await apiService(`/chat/${chatId}`);
        if (response.success) {
            const existingChat = chats.find(chat => chat._id === chatId);
            let messages = response.messages || [];
            if (messages.length > 0) {
                const transformedMessages = messages.map(message => {
                    return {
                        ...message,
                        createdAt: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '',
                    };
                });
                messages = transformedMessages;
            }

            setSelectedChat({
                ...existingChat,
                messages: messages,
            });

            chats.forEach(chat => {
                if (chat._id === chatId) chat.unreadCount = 0;
            });   

            socket.emit('mark-read', {
                chatId: chatId,
                userId: user._id
            });
        } else {
            console.error('Error fetching chat:', response);
            NewSwal.fire({ icon: 'error', title: 'Errore', text: response.message });
        }
    }

    useEffect(() => {
        if (user?._id) fetchChats();
        if (selectedChat) fetchChat(selectedChat._id);
    }, [user?._id, refreshKey]);

    return (
        <ChatContext.Provider value={{
            chats,
            setChats,
            selectedChat,
            setSelectedChat,
            onlineUsers,
            setOnlineUsers,
            fetchChats,
            fetchChat,
            isDesktop,
            newMessage,
            setNewMessage,
            searchTerm,
            setSearchTerm
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export { ChatProvider };

export const useChat = () => { 
    const context = useContext(ChatContext);
    if (context === null) {
      throw new Error('useChat must be used within a ChatProvider');
    }
    return context; 
}