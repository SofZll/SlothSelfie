import { useState, useEffect, useRef } from 'react';
import './css/MessageBox.css';
import { useMediaQuery } from 'react-responsive';
import Swal from 'sweetalert2';

function MessageBox({ username}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [chat, setChat] = useState([
        {
            author: {
                username: 'User1',
                image: 'https://via.placeholder.com/150'
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
                    author: 'User2',
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
            lastMessage: 'Hello'
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
            lastMessage: 'Hi'
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
            lastMessage: 'Hey'
        },
        {
            author: {
                username: 'User1',
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
            lastMessage: 'Hey'
        },
        {
            author: {
                username: 'User1',
                image: 'https://via.placeholder.com/150'
            },
            messages: [],
            lastMessage: 'Hey'
        }
    ]);
    const messagesEndRef = useRef(null);
    const isDesktop = useMediaQuery({ minWidth: 769 });

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
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
                        author: {username}, 
                        text: newMessage, 
                        date: new Date()
                    }
                ],
                lastMessage: newMessage
            };

            setChat(chat.map(chat => chat === selectedChat ? updateChat : chat));
            setSelectedChat(updateChat);
            setNewMessage("");
        }
    }

    useEffect(() => {
        if (selectedChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChat, selectedChat?.messages]);

    if (!isDesktop) return null;

    return (
        <div className="message-container">
            <button onClick={() => setIsOpen(!isOpen)} className="message-button">
                Messaggi
            </button>
            <div className={`message-box ${isOpen ? 'open' : ''}`}>
                {selectedChat ? (
                    <div className="chat-selected">
                        <div className="chat-selected-header">
                            <span onClick={() => handleChatClick(null)}>Back</span>
                            <img src={selectedChat.author.image} alt="profile" />
                            <h6>{selectedChat.author.username}</h6>
                        </div>
                        <div className="chat-selected-messages">
                            {selectedChat.messages.map((message, index) => (
                                <div key={index} className={`message ${message.author === 'User1' ? 'sent' : 'received'}`}>
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
                    <div className="chat-all">
                        {chat.map((chat, index) => (
                            <div key={index} className="chat" onClick={() => handleChatClick(chat)}>
                                <div className="chat-container">
                                    <img src={chat.author.image} alt="profile" />
                                    <div className="chat-content">
                                        <span>{chat.author.username}</span>
                                        <p>{chat.lastMessage}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessageBox;