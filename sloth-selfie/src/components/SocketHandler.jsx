import { useEffect, useContext } from 'react';
import { useChat } from '../context/ChatContext';
import { authContext } from '../context/AuthContext';
import socket from '../services/socket/socket';
import { notificationSound, messageSound } from '../utils/soundsUtils';
import { toastInfo, toastWarning } from '../utils/swalUtils';

const SocketHandler = () => {
    const { user } = useContext(authContext);
    const { selectedChat, setSelectedChat, setOnlineUsers, setChats } = useChat();

    useEffect(() => {
        if (!user?._id) return;
        
        const handleStatusChange = ({ userId, isOnline }) => {
            setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
        };

        const handleReceiveMessage = (message) => {
            messageSound();

            Toast.fire({
                icon: 'info',
                title: `New message from ${message.sender.username}`,
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'View',
                cancelButtonText: 'Ignore',
            }).then((result) => {
                if (result.isConfirmed) {
                    const matchedChat = chats.find(chat => chat._id === message.chat._id);
                    if (matchedChat) {
                        setSelectedChat(matchedChat);
                        setIsOpen(true);
                    }
                }
            });

            if (!selectedChat || !message.chat) return;

            if (selectedChat?._id === message.chat._id) {
                setSelectedChat((prevChat) => {
                    const updatedMessages = [...prevChat.messages, {
                        ...message,
                        createdAt: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '',
                    }];
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

    useEffect(() => {
        if (!user?._id || Notification.permission !== 'granted') return;

        const handler = ({ title, body, notificationId, elementId, elementType, urgency }) => {
            console.log('Notification received:', { title, body, notificationId, elementId, urgency });
            let link = '';
            if (urgency) {
                link = `/calendar?type=Activity&element=${elementId}`;
                toastWarning(title, body, link);
            } else {
                link = `/calendar?type=${elementType}&element=${elementId}`;
                toastInfo(title, body, link);
            }
            notificationSound();
        };
        socket.on('system-notification', handler);

        return () => socket.off('system-notification', handler);
    }, [user]);

    useEffect(() => {
        if (user?._id) socket.connect();
        else socket.disconnect();
    }, [user]);

    return null;
}

export default SocketHandler;