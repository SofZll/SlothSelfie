import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './css/ShareInput.css';

const ShareInput = ({ changeReceivers, resetReceivers}) => {
    const [receiverInput, setReceiverInput] = useState('');
    const [receivers, setReceivers] = useState([]);

    useEffect(() => {
        if (resetReceivers) {
            setReceivers([]);
        }
    }, [resetReceivers]);

    const addReceiver = () => {
        if (receiverInput) {
            if (receivers.includes(receiverInput)) {
                Swal.fire({
                    title: 'Error',
                    text: 'Receiver already added!',
                    icon: 'error',
                    customClass: {
                        confirmButton: 'button-alert'
                    }
                });
                return;
            }
            const newReceivers = [...receivers, receiverInput];
            setReceivers(newReceivers);
            setReceiverInput('');
            changeReceivers(newReceivers);
        }
    }

    const removeReceiver = (index) => {
        const newReceivers = receivers.filter((_, i) => i !== index);
        setReceivers(newReceivers);
        changeReceivers(newReceivers);
    }

    const enterKey = (e) => {
        if (e.key === 'Enter') {
            addReceiver();
        }
    }

    return (
        <div className="share-input">
            <div className="add-receiver">
                <input 
                    type="text" 
                    placeholder="Enter receiver's username" 
                    value={receiverInput} 
                    onChange={(e) => setReceiverInput(e.target.value)}
                    onKeyDown={enterKey}/>
                <button className="btn btn-main new-notif-button" onClick={() => addReceiver()}>Add</button>
            </div>
            <div className="receivers-list">
                {receivers.map((receiver, index) => (
                    <div key={index} className="receiver-tag">
                        {receiver}
                        <button className="remove-receiver-button" onClick={() => removeReceiver(index)}>&times;</button>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default ShareInput;