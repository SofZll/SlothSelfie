import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import avatar from '../assets/icons/avatar.svg';
import '../styles/ChatBox.css';
import Swal from 'sweetalert2';

import { apiService } from '../services/apiService';
import { useIsDesktop } from '../utils/utils';
import { UserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

const ChatBox = () => {
    const { username } = useContext(UserContext);
    const { chatId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const isDesktop = useIsDesktop();
    
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [chat, setChat] = useState([
        {
            author: {
                username: 'User1',
                image: avatar
            },
            messages: [
                {
                    author: 'User1',
                    text: 'Hello1',
                    date: '12:00'
                },
                {
                    author: 'User2',
                    text: 'Hi',
                    date: '12:01'
                },
                {   
                    author: 'Kmoon',
                    text: 'Hey',
                    date: '12:02'
                },
                {
                    author: 'User2',
                    text: 'Rispondimiiiiiiii',
                    date: '12:01'
                },
                {   
                    author: 'User2',
                    text: 'Hey',
                    date: '12:02'
                },
                {
                    author: 'User2',
                    text: 'Hi',
                    date: '12:01'
                },
                {   
                    author: 'User2',
                    text: 'Hey',
                    date: '12:02'
                }
            ],
            lastMessage: {
                author: 'User2',
                text: 'Hi',
                date: '12:01'
            }
        },
        {
            author: {
                username: 'User1',
                image: 'https://via.placeholder.com/150'
            },
            messages: [
                {
                    author: 'User1',
                    text: 'Hello2',
                    date: '12:00'
                },
                {
                    author: 'User2',
                    text: 'Hi',
                    date: '12:01'
                },
                {   
                    author: 'User2',
                    text: 'Hey',
                    date: '12:02'
                }
            ],
            lastMessage: {
                author: 'User2',
                text: 'Hi',
                date: '12:55'
            }
        },
        {
            author: {
                username: 'User1',
                image: 'https://via.placeholder.com/150'
            },
            messages: [
                {
                    author: 'User1',
                    text: 'Hello3',
                    date: '12:00'
                },
                {
                    author: 'User2',
                    text: 'Hi',
                    date: '12:01'
                },
                {   
                    author: 'User2',
                    text: 'Hey',
                    date: '12:02'
                }
            ],
            lastMessage: {
                author: 'User2',
                text: 'Hi',
                date: '12:01'
            }
        },
        {
            author: {
                username: 'User5',
                image: 'https://via.placeholder.com/150'
            },
            messages: [
                {
                    author: 'User1',
                    text: 'Hello4',
                    date: '12:00'
                },
                {
                    author: 'User2',
                    text: 'Hi',
                    date: '12:01'
                },
                {   
                    author: 'User2',
                    text: 'Hey',
                    date: '12:02'
                }
            ],
            lastMessage: {
                author: 'User2',
                text: 'Hi',
                date: '12:01'
            }
        },
        {
            author: {
                username: 'User1',
                image: 'https://via.placeholder.com/150'
            },
            messages: [],
            lastMessage: {
                author: 'User2',
                text: 'Hi',
                date: '12:01'
            }
        }
    ]);
    const [searchChat, setSearchChat] = useState(chat);

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        if (!isDesktop && chat) {
            navigate(`/chat/${chat.author.username}`);
        }
    }

    const handleSendMessage = () => {
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

            setChat(chat.map(chat => chat === selectedChat ? updateChat : chat));
            setSelectedChat(updateChat);
            setNewMessage("");
        }
    }

    const handleSearch = (e) => {
        const search = e.target.value.toLowerCase();
        const filteredChat = chat.filter(chat => chat.author.username.toLowerCase().includes(search));
        setSearchChat(filteredChat);
        if (search === "") {
            setSearchChat(chat);
        }
    }

    const handleNewChat = () => {
        Swal.fire({ icon: 'info', title: 'Nuovo messaggio', text: 'Funzionalità non ancora implementata' });
    }

    useEffect(() => {
        console.log("ChatBox mounted");
        if (chatId) {
            const matchedChat = chat.find(chat => chat.author.username === chatId);
            if (matchedChat) {
                setSelectedChat(matchedChat);
            }
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
                    <div className="d-flex align-items-center gap-3 justify-content-start ps-3 chat-selected-header">
                        <span onClick={(e) => { e.stopPropagation(); setSelectedChat(null); }}>Back</span>
                        <div className="d-flex align-items-center position-relative">
                            <img src={selectedChat.author.image} alt="profile" className='rounded-circle me-2'/>
                            <div className="d-inline-block position-absolute bottom-0 online-status"></div>
                        </div>
                        <div className="d-flex w-100 flex-column align-items-start chat-content">
                            <h6>{selectedChat.author.username}</h6>
                            <span>status</span>
                        </div>
                    </div>
                </>
            ) : (
                <h5 className={`${isDesktop ? "fs-5" : ""}`}>Messaggi</h5>
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
                    <div className="d-flex h-100 flex-column">
                        <div className="d-flex flex-column h-auto overflow-y-auto p-1 chat-selected-messages">
                            {selectedChat.messages.map((message, index) => (
                                <div key={index} className={`message ${message.author === username ? 'sent' : 'received'}`}>
                                    <p>{message.text}</p>
                                    <span>{message.date}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                        <div className="d-flex gap-2 p-2 chat-input">
                            <input type="text" className='form-control p-1' placeholder="Scrivi un messaggio" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button className='chat-input-button' onClick={handleSendMessage}>Invia</button>
                        </div>
                    </div>
                ) : (
                    <div className="h-100 cursor-pointer">
                        <div className="d-flex flex-row p-2 gap-1">
                            <input type="text" className='form-control p-1' placeholder="Cerca" onChange={handleSearch}/>
                            <button className="new-chat-button" onClick={handleNewChat}>+</button>
                        </div>
                        {searchChat.length > 0 ? (
                            searchChat.map((chat, index) => (
                                <div key={index} className='mx-1 px-3 py-2 chat' onClick={() => handleChatClick(chat)}>
                                    <div className="d-flex align-items-center flex-row chat-container">
                                        <div className="d-flex align-items-center position-relative">
                                            <img src={chat.author.image} alt="profile" className='rounded-circle me-2'/>
                                            <div className="d-inline-block position-absolute bottom-0 online-status online-status-big"></div>
                                        </div>
                                        <div className="d-flex w-100 flex-column align-items-start chat-content">
                                            <div className="d-flex w-100 align-items-center flex-row justify-content-between">
                                                <span className="chat-username">{chat.author.username}</span>
                                                <span className="chat-date">{chat.lastMessage.date}</span>
                                            </div>
                                            <p>{chat.lastMessage.text}</p>
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