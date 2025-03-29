import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import avatar from '../assets/icons/avatar.svg';
import '../styles/ChatBox.css';
import Swal from 'sweetalert2';
import { Plus, Undo2 } from 'lucide-react'

import { apiService } from '../services/apiService';
import { useIsDesktop } from '../utils/utils';
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
    const [partecipants, setPartecipants] = useState([]);
    const [chats, setChats] = useState([]);

    const fetchChats = async () => {
        const response = await apiService('/chat/chats', 'GET');
        if (response) {
            const chats = response.chats;
            const tranformedData = chats.map(chat => ({
                ...chat,
                otherParticipant: chat.participants.find(p => p._id !== user._id)
            }));
            setChats(tranformedData)
            setSearchChat(tranformedData);
            console.log(tranformedData);
        } else {
            console.error('Error fetching chats:', response);
        }
    }

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        if (!isDesktop && chat) {
            navigate(`/chat/${chat.author.username}`);
        }
    }

 
    const handleSendMessage = () => {   /*
        if (!newMessage.trim()) {
            Swal.fire({ icon: 'error', title: 'Errore', text: 'Inserisci un messaggio' });
        } else {
            const updateChat = {
                ...selectedChat,
                messages: [
                    ...selectedChat.messages,
                    { 
                        author: username, 
                        text: newMessage, 
                        date: new Date().toLocaleTimeString()
                    }
                ],
                lastMessage: {
                    author: username,
                    text: newMessage,
                    date: new Date().toLocaleTimeString()
                }
            };

            setChats(chats.map(chat => chat === selectedChat ? updateChat : chat));
            setSelectedChat(updateChat);
            setNewMessage('');
        }  */
    }
      

    const handleSearch = (e) => {
        const search = e.target.value.toLowerCase();
        const filteredChat = chats.filter(chat => chat.author.username.toLowerCase().includes(search));
        setSearchChat(filteredChat);
        if (search === '') {
            setSearchChat(chats);
        }
    }

    const handleNewChat = () => {
        console.log('Creating new chat with:', partecipants[0]);
        const response = apiService('/chat/new-chat', 'POST', {username2: partecipants[0] });
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
            const matchedChat = chats.find(chat => chat.author.username === chatId);
            if (matchedChat) {
                setSelectedChat(matchedChat);
            }
        } else {
            fetchChats();
        }
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
                            <img src={selectedChat.author.image} alt='profile' className='rounded-circle me-2'/>
                            <div className='d-inline-block position-absolute bottom-0 online-status'></div>
                        </div>
                        <div className='d-flex w-100 flex-column align-items-start chat-content'>
                            <h6>{selectedChat.author.username}</h6>
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
                        <div className='d-flex flex-column h-auto overflow-y-auto p-1 chat-selected-messages'>
                            {selectedChat.messages.map((message, index) => (
                                <div key={index} className={`message ${message.author === user.username ? 'sent' : 'received'}`}>
                                    <p>{message.text}</p>
                                    <span>{message.date}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                        <div className='d-flex gap-2 p-2 chat-input'>
                            <input type='text' className='form-control p-1' placeholder='Scrivi un messaggio' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
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
                                <ShareInput receivers={partecipants} setReceivers={setPartecipants} />
                                {partecipants.length > 0 ? <button className='button-clean green my-2 ' onClick={handleNewChat}>Create</button> : <button className='new-chat-button d-flex align-items-start mt-3' onClick={() => setShowShareInput (!showShareInput)}><Undo2 /></button>}
                            </div>
                        )}
                        {searchChat && searchChat.length > 0 ? (
                            searchChat.map((chat, index) => (
                                <div key={index} className='mx-1 px-3 py-2 chat' onClick={() => handleChatClick(chat)}>
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
                                            {chat.lastMessage ? <p>{chat.lastMessage.content}</p> : <p>New chat</p> }
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Nessun messaggio</p>
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