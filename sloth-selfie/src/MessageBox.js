import { useState } from 'react';
import './css/MessageBox.css';
import { useMediaQuery } from 'react-responsive';

function MessageBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState([
        {
            username: 'User1',
            lastMessage: 'Hello'
        },
        {
            username: 'User2',
            lastMessage: 'Hi'
        },
        {
            username: 'User3',
            lastMessage: 'Hey'
        }
    ]);
    const isDesktop = useMediaQuery({ minWidth: 769 });

    if (!isDesktop) return null;

    return (
        <div className="message-container">
            <button onClick={() => setIsOpen(!isOpen)} className="message-button">
                Messaggi
            </button>
            <div className={`message-box ${isOpen ? 'open' : ''}`}>
                {chat.map((chat, index) => (
                    <div key={index} className="chat">
                        <div className="chat-container">
                            <img src="https://via.placeholder.com/50" alt="profile" />
                            <div className="chat-content">
                                <p>{chat.username}</p>
                                <p>{chat.lastMessage}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MessageBox;