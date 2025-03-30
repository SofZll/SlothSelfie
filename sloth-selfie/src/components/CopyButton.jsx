import React, { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { htmlToText } from 'html-to-text';

const CopyButton = ({ Note }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copyText();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyText = () => {
        let copiedContent = Note.title;

        if (Note.content.length > 0) {
            copiedContent += '\n\nContent:\n' + htmlToText(Note.content, { wordwrap: false });
        }

        if (Note.tasks.length > 0) {
            copiedContent += '\n\nTasks:';
            Note.tasks.forEach((task, i) => {
                copiedContent += `\n${i + 1}. ${task.title} ${task.completed ? '(completed)' : ''}`;
                if (task.deadline) {
                    copiedContent += ` (${new Date(task.deadline).toLocaleDateString()})`;
                }
            });
        }

        navigator.clipboard.writeText(copiedContent);
    }

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5em' }}>
            <div className='text-break fw-bold fs-4' style={{ color: '#244476' }}>
                {Note.title}
            </div>
            <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label="Copy text"
                onClick={() => handleCopy()}
            >
                {copied ? <FaCheck color="#244476" /> : <FaCopy color="#244476" />}
            </button>
        </div>
    );
};

export default CopyButton;