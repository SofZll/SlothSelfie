import React, { useState, useEffect } from 'react';
import '../styles/ShareInput.css';
import Swal from 'sweetalert2';

const ShareInput = ({ receivers, setReceivers }) => {
    const [receiverInput, setReceiverInput] = useState('');
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

    useEffect(() => {
        console.log('Current receivers:', receivers);
        console.log('Type of receivers:', Array.isArray(receivers) ? 'array' : typeof receivers);
        if (receivers.some(r => r === undefined)) {
            console.warn('Undefined values detected in receivers!');
        }
    }, [receivers]);

    return (
        <div className='container my-2 p-0 justify-content-start'>
            <div className='d-flex flex-column align-items-center'>
                <div className='d-flex w-100 justify-content-between align-items-center mb-3'>
                    <input type='text' className='form-control me-2 input-receiver' id='receivers' placeholder='Enter receivers username' value={receiverInput} onChange={(e) => setReceiverInput(e.target.value)} onKeyDown={enterKey} />
                    <button type='button' className='button-clean yellow' onClick={addReceiver}>
                        Add
                    </button>
                </div>
                <div className='d-flex flex-wrap gap-2 w-100'>
                    {receivers.map((receiver, index) => (
                        <div key={index} className={`badge bg-secondary d-flex align-items-center ${
                                removingIndex === index ? 'fade-out' : 'fade-in'}`}>
                            {receiver}
                            <button type='button' className='btn-close btn-close-white ms-2 close-small' onClick={() => removeReceiver(index)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default ShareInput;