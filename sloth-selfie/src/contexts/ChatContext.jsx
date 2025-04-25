import React, { useState, createContext, useContext, useEffect } from 'react';

import { apiService } from '../services/apiService';
import { useIsDesktop, bufferToBase64 } from '../utils/utils';
import { AuthContext } from './AuthContext';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
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
            console.log('Fetched chats:', response);
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
            console.log(transformedData);

            //get status of users
            const onlineUsers = {};
            await Promise.all(transformedData.map(async (chat) => {
                const response2 = await apiService(`/user/profile/${chat.otherParticipant._id}`);
                if (response2.success) {
                    console.log('response2:', response2);
                    onlineUsers[chat.otherParticipant._id] = response2.user.isOnline;
                    console.log('Online users:', onlineUsers);
                } else {
                    console.error('Error fetching user status:', response2);
                }
            }));

            setOnlineUsers(onlineUsers);
        } else {
            console.error('Error fetching chats:', response);
        }
    }

    useEffect(() => {
        if (user?._id) fetchChats();
    }, [user?._id]);

    return (
        <ChatContext.Provider value={{
            chats,
            setChats,
            selectedChat,
            setSelectedChat,
            onlineUsers,
            setOnlineUsers,
            fetchChats,
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