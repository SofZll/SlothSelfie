import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import avatar from '../assets/icons/avatar.svg';
import '../styles/ChatBox.css';
import Swal from 'sweetalert2';
import { Plus, Undo2 } from 'lucide-react'

import { apiService } from '../services/apiService';
import { useIsDesktop, bufferToBase64 } from '../utils/utils';
import { AuthContext } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import ShareInput from './ShareInput';

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { chatId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const isDesktop = useIsDesktop();
    
    const [showShareInput, setShowShareInput] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchChat, setSearchChat] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [chats, setChats] = useState([]);

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
                        image: base64Image
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
            setSearchChat(transformedData);
            console.log(transformedData);
        } else {
            console.error('Error fetching chats:', response);
        }
    }

    const handleChatClick = async (chatId) => {
        console.log('click rilevato');
        const response = await apiService(`/chat/${chatId}`, 'GET');
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
            const updateChat = {
                ...selectedChat,
                messages: [
                    ...(selectedChat.messages || []),
                    {
                        sender: {
                            username: user.username, 
                        },
                        content: {
                            text: newMessage,
                        },
                        createdAt: new Date().toLocaleTimeString()
                    }
                ],
                lastMessage: {
                    sender: {
                        username: user.username, 
                    },
                    content: {
                        text: newMessage,
                    },
                    createdAt: new Date().toLocaleTimeString(),
                }
            };
            console.log('NewMessage:', newMessage);
            const response = apiService(`/chat/${selectedChat._id}/message`, 'POST', { message: newMessage });
            if (response) {
                console.log('Message sent:', response);
                setSelectedChat(updateChat);
                setNewMessage('');
            } else {
                console.error('Error sending message:', response);
                Swal.fire({ icon: 'error', title: 'Errore', text: response.message });
            }
        }
    }

    const handleSearch = (e) => {
        const search = e.target.value.toLowerCase();
        const filteredChat = chats.filter(chat => chat.otherParticipant.username.toLowerCase().includes(search));
        setSearchChat(filteredChat);
        if (search === '') {
            setSearchChat(chats);
        }
    }

    const handleNewChat = async () => {
        const response = await apiService('/chat/new-chat', 'POST', {username2: participants[0] });
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
        if (chatId) {
            const matchedChat = chats.find(chat => chat.otherParticipant.username === chatId);
            if (matchedChat) {
                setSelectedChat(matchedChat);
            }
        } else fetchChats();
    }, [chatId]);

    useEffect(() => {
        if (selectedChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChat]);

    const chatHeader = (
        <>
            {selectedChat ? (
                <>
                    <div className='d-flex align-items-center gap-3 justify-content-start ps-3 chat-selected-header'>
                        <span onClick={(e) => { e.stopPropagation(); setSelectedChat(null); }}>Back</span>
                        <div className='d-flex align-items-center position-relative'>
                            <img src={selectedChat.otherParticipant.image} alt='profile' className='rounded-circle me-2'/>
                            <div className='d-inline-block position-absolute bottom-0 online-status'></div>
                        </div>
                        <div className='d-flex w-100 flex-column align-items-start chat-content'>
                            <h6>{selectedChat.otherParticipant.username}</h6>
                            <span>status</span>
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
                                <input type='text' className='form-control p-1' placeholder='Cerca' onChange={handleSearch}/>
                                <button className='new-chat-button d-flex align-items-center' onClick={() => setShowShareInput (!showShareInput)}><Plus /></button>
                            </div>
                        ) : (
                            <div className='d-flex flex-row'>
                                <ShareInput receivers={participants} setReceivers={setParticipants} />
                                {participants.length > 0 ? <button className='button-clean green my-2 ' onClick={handleNewChat}>Create</button> : <button className='new-chat-button d-flex align-items-start mt-3' onClick={() => setShowShareInput (!showShareInput)}><Undo2 /></button>}
                            </div>
                        )}
                        {searchChat && searchChat.length > 0 ? (
                            searchChat.map((chat, index) => (
                                <div key={index} className='mx-1 px-3 py-2 chat' onClick={() => handleChatClick(chat._id)}>
                                    <div className='d-flex align-items-center flex-row chat-container'>
                                        <div className='d-flex align-items-center position-relative'>
                                            <img src={chat.otherParticipant.image} alt='profile' className='rounded-circle me-2'/>
                                            <div className='d-inline-block position-absolute bottom-0 online-status online-status-big'></div>
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