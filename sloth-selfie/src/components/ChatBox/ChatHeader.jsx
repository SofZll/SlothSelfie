import React from 'react';

import { useChat } from '../../contexts/ChatContext';

const ChatHeader = () => {
    const { selectedChat, setSelectedChat, onlineUsers, isDesktop } = useChat();

    return (
        <>
            {selectedChat && selectedChat.otherParticipant ? (
                <div className={`d-flex align-items-center gap-3 justify-content-start ps-3 chat-selected-header ${isDesktop ? 'desktop' : 'py-2 bg-white border-bottom border-1'}`}>
                    <span role="button" aria-label="Go back to chat list" onClick={(e) => { e.stopPropagation(); setSelectedChat(null); }}>Back</span>
                    <div className='d-flex align-items-center position-relative'>
                        <img src={selectedChat.otherParticipant.image} alt='profile' className='rounded-circle me-2'/>
                        {onlineUsers[selectedChat.otherParticipant._id] && (
                            <div className='d-inline-block position-absolute bottom-0 online-status'></div> 
                        )}
                    </div>
                    <div className='d-flex w-100 flex-column align-items-start chat-content'>
                        <h6>{selectedChat.otherParticipant.username}</h6>
                        {onlineUsers[selectedChat.otherParticipant._id] ? <span>Online</span> : <span>Offline</span>}
                    </div>
                </div>
            ) : (
                <h5 className={`${isDesktop ? 'fs-5 m-0' : 'ps-3 m-0 py-3 bg-white'}`}>Chat</h5>
            )}
        </>
    )
}

export default ChatHeader;