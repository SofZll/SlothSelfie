import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaCopy, FaCheck } from 'react-icons/fa';

const CopyableId = ({ id }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Resetta lo stato "copiato" dopo 2 secondi
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5em' }}>
      <span>{id}</span>
      <CopyToClipboard text={id} onCopy={handleCopy}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Copy ID"
        >
          {copied ? <FaCheck color="#F9F9F9" /> : <FaCopy color="#F9F9F9" />}
        </button>
      </CopyToClipboard>
    </div>
  );
};

export default CopyableId;
