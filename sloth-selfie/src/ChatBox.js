import { useState, useEffect, useRef, useMemo } from 'react';
import './css/ChatBox.css';
import { useMediaQuery } from 'react-responsive';
import Swal from 'sweetalert2';
import avatar from './media/avatar.svg'
import { useParams, useNavigate } from 'react-router-dom';

function ChatBox({ username }) {
    const { chatId } = useParams(); // get chatId from url
    const navigate = useNavigate();
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
    const messagesEndRef = useRef(null);
    const isDesktop = useMediaQuery({ minWidth: 769 });

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        if (!isDesktop) {
            navigate(`/chat/${chat.author.username}`);
        }
    }

    const handleSendMessage = () => {
        if (!newMessage.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Inserisci un messaggio'
            });
        } else {
            const updateChat = {
                ...selectedChat,
                messages: [
                    ...selectedChat.messages,
                    { 
                        author: username, 
                        text: newMessage, 
                        date: new Date()
                    }
                ],
                lastMessage: {
                    author: username,
                    text: newMessage,
                    date: new Date()
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
        Swal.fire({
            icon: 'info',
            title: 'Nuovo messaggio',
            text: 'Funzionalità non ancora implementata'
        });
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

    return (
        <div className={`message-container ${isDesktop ? 'desktop' : ''}`}>
            {isDesktop ? (
                <button onClick={() => setIsOpen(!isOpen)} className="message-button">
                    {selectedChat ? (
                        <div className="chat-selected-header">
                            <span onClick={() => handleChatClick(null)}>Back</span>
                            <div className="chat-profile">
                                <img src={selectedChat.author.image} alt="profile" />
                                <div className="online-status"></div>
                            </div>
                            <div className="chat-content">
                                <h6>{selectedChat.author.username}</h6>
                                <span>status</span>
                            </div>
                        </div>
                    ) : <p>Messaggi</p>}
                </button>
            ) : (
                <h3>Messaggi</h3>
            )}
            <div className={`message-box ${isOpen ? 'open' : ''} ${isDesktop ? 'desktop' : ''}`}>
                {selectedChat ? (
                    <div className="chat-selected">
                        <div className="chat-selected-messages">
                            {selectedChat.messages.map((message, index) => (
                                <div key={index} className={`message ${message.author === username ? 'sent' : 'received'}`}>
                                    <p>{message.text}</p>
                                    <span>{message.date}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                        <div className="chat-input">
                            <input type="text" placeholder="Scrivi un messaggio" />
                            <button onClick={handleSendMessage}>Invia</button>
                        </div>
                    </div>
                ) : (
                    <div className={`chat-all ${isDesktop ? 'desktop' : ''}`}>
                        <div className="chat-search">
                            {/* search bar for chat*/}
                            <input type="text" placeholder="Cerca" onChange={handleSearch}/>
                            <button className="new-chat-button" onClick={handleNewChat}>+</button>
                        </div>
                        {searchChat.length > 0 ? (
                            searchChat.map((chat, index) => (
                                <div key={index} className="chat" onClick={() => handleChatClick(chat)}>
                                    <div className="chat-container">
                                        <div className="chat-profile">
                                            <img src={chat.author.image} alt="profile" />
                                            <div className="online-status online-status-big"></div>
                                        </div>
                                        <div className="chat-content">
                                            <div className="chat-header">
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
}

export default ChatBox;