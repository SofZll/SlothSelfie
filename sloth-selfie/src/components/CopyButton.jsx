import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaCopy, FaCheck } from 'react-icons/fa';

const CopyButton = ({ Note }) => {
    const [copied, setCopied] = useState(false);
    const [text, setText] = useState('');

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Resetta lo stato "copiato" dopo 2 secondi
    };

    useEffect(() => {
        let copiedContent = Note.title;

        if (Note.content.length > 0) {
            copiedContent += '\n\n' + Note.content;
        }

        if (Note.tasks.length > 0) {
            copiedContent += '\n\nTasks:';
            Note.tasks.forEach((task, i) => {
                copiedContent += `\n${i + 1}. ${task.text} ${task.completed ? '(completed)' : ''}`;
                if (task.deadline) {
                    copiedContent += ` (${new Date(task.deadline).toLocaleDateString()})`;
                }
            });
        }

        setText(copiedContent);
    }, [Note]);

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5em' }}>
            <div className='text-break fw-bold fs-4'>
                {Note.title}
            </div>
            <CopyToClipboard text={text} onCopy={handleCopy}>
                <button
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                }}
                aria-label="Copy text"
                >
                {copied ? <FaCheck color="#555B6E" /> : <FaCopy color="#555B6E" />}
                </button>
            </CopyToClipboard>
        </div>
    );
};

export default CopyButton;