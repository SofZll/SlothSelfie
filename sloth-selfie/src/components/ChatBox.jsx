import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ChatBox.css';
import Swal from 'sweetalert2';
import { Plus, Undo2 } from 'lucide-react'
import socket from '../services/socket';

import { apiService } from '../services/apiService';
import { useIsDesktop, bufferToBase64 } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import ShareInput from './ShareInput';

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { chatId } = useParams();
    const navigate = useNavigate();
    const hasJoinedRef = useRef(false);
    const messagesEndRef = useRef(null);
    const isDesktop = useIsDesktop();
    
    const [showShareInput, setShowShareInput] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [participants, setParticipants] = useState([]);
    const [chats, setChats] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});

    const fetchChats = async () => {
        const response = await apiService('/chat', 'GET');
        if (response) {
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
                if (response2) {
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

    const handleChatClick = async (chatId) => {
        console.log('click rilevato');
        const response = await apiService(`/chat/${chatId}`);
        if (response) {
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

            setIsOpen(true);
            setNewMessage('');
            setShowShareInput(false);
            setParticipants([]);
        } else {
            console.error('Error fetching chat:', response);
            Swal.fire({ icon: 'error', title: 'Errore', text: response.message });
        }
        if (!isDesktop && chats) {
            navigate(`/chat/${selectedChat.otherParticipant.username}`);
        }
    }

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

    const filteredChats = useMemo(() => {
        return chats.filter(chat => 
            chat.otherParticipant.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [chats, searchTerm]);

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

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
        return () => {
            socket.disconnect();
        };
    }, []);    

    useEffect(() => {
        if (chatId) {
            const matchedChat = chats.find(chat => chat.otherParticipant.username === chatId);
            if (matchedChat) {
                setSelectedChat(matchedChat);
            }
        } else {
            if (user?._id) fetchChats();
        }
    }, [chatId, user?._id]);

    useEffect(() => {
        if (selectedChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChat]);

    
    useEffect(() => {
        if (user?._id) {
            socket.emit('join-chatroom', user._id);
            console.log('User joined chatroom:', user._id);
            socket.emit('online-user', user._id);
        }
    }, [user?._id]);

    useEffect(() => {
        if (!user?._id) return;
        socket.emit('online-user', user._id);

        socket.on('status-change', ({ userId, isOnline }) => {
            console.log('User status changed:', userId, isOnline);
            setOnlineUsers(prev => ({
                ...prev,
                [userId]: isOnline
            }));
        });

        socket.on('receive-message', (message) => {
            console.log('New message received:', message);
            if (selectedChat && selectedChat._id === message.chat._id) {
                setSelectedChat((prevChat) => {
                    const updatedMessages = [...prevChat.messages,
                        {
                            ...message,
                            createdAt: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '',
                        }
                    ];
                    console.log('Updated messages:', updatedMessages);
                    updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    return { ...prevChat, messages: updatedMessages };
                });
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        });

        return () => {
            socket.off('status-change');
            socket.off('receive-message');
        }
    }, [user?._id, selectedChat, chats]);

    useEffect(() => {
        console.log("Current users status:", onlineUsers);
    }, [onlineUsers]);
    
    const chatHeader = (
        <>
            {selectedChat ? (
                <>
                    <div className='d-flex align-items-center gap-3 justify-content-start ps-3 chat-selected-header'>
                        <span onClick={(e) => { e.stopPropagation(); setSelectedChat(null); }}>Back</span>
                        <div className='d-flex align-items-center position-relative'>
                            <img src={selectedChat.otherParticipant.image} alt='profile' className='rounded-circle me-2'/>
                            {onlineUsers[selectedChat.otherParticipant._id] && (
                                <div className='d-inline-block position-absolute bottom-0 online-status'></div> 
                            )}
                        </div>
                        <div className='d-flex w-100 flex-column align-items-start chat-content'>
                            <h6>{selectedChat.otherParticipant.username}</h6>
                            {onlineUsers[selectedChat.otherParticipant._id] && <span>Online</span> }
                        </div>
                    </div>
                </>
            ) : (
                <h5 className={`${isDesktop ? 'fs-5' : ''}`}>Messaggi</h5>
            )
            }
        </>
    );

    const chatContent = (
        <div className={`d-relative flex-column message-container ${isDesktop ? 'desktop' : ''} `}>
            {isDesktop ? (
                <button className='pe-auto message-button' onClick={() => setIsOpen(prevState => !prevState)}>
                    {chatHeader}
                </button>
            ) : (
                chatHeader
            )}
            <div className={`message-box ${isOpen ? 'open' : ''}`}>
                {selectedChat ? (
                    <div className='d-flex h-100 flex-column'>
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
                        <div className='d-flex gap-2 p-2 chat-input'>
                            <input type='text' className='form-control p-2' placeholder='Scrivi un messaggio' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button className='chat-input-button' onClick={handleSendMessage}>Invia</button>
                        </div>
                    </div>
                ) : (
                    <div className='h-100 cursor-pointer'>
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
                                                <span className='chat-username'>{chat.otherParticipant.username}</span>
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