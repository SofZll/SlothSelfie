import React, { useState, useEffect } from 'react';
import '../styles/ShareInput.css';
import Swal from 'sweetalert2';

const ShareInput = () => {
    const [receiverInput, setReceiverInput] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [removingIndex, setRemovingIndex] = useState(null);

    const addReceiver = () => {
        if (receiverInput.trim() !== '') {
            if (!receivers.includes(receiverInput.trim())) {
                setReceivers([...receivers, receiverInput.trim()]);
                setReceiverInput('');
            } else {
                Swal.fire('Utente già inserito', '', 'warning');
            }
        }
    };

    const removeReceiver = (index) => {
        setRemovingIndex(index);
        setTimeout(() => {
            const newReceivers = [...receivers];
            newReceivers.splice(index, 1);
            setReceivers(newReceivers);
            setRemovingIndex(null);
        }, 300);
    };

    const enterKey = (e) => {
        if (e.key === 'Enter' && e.target.id === 'receivers') addReceiver();
    };

    return (
        <div className="container my-3">
            <div className="d-flex flex-column align-items-center">
                <div className="d-flex w-100 justify-content-between align-items-center mb-3">
                    <input type="text" className="form-control me-2 input-receiver" id='receivers' placeholder="Enter receiver's username" value={receiverInput} onChange={(e) => setReceiverInput(e.target.value)} onKeyDown={enterKey} />
                    <button type="button" className="btn btn-add btn-clean" onClick={addReceiver}>
                        Add
                    </button>
                </div>
                <div className="d-flex flex-wrap gap-2 w-100">
                    {receivers.map((receiver, index) => (
                        <div key={index} className={`badge bg-secondary d-flex align-items-center ${
                                removingIndex === index ? 'fade-out' : 'fade-in'}`}>
                            {receiver}
                            <button type="button" className="btn-close btn-close-white ms-2 close-small" onClick={() => removeReceiver(index)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default ShareInput;