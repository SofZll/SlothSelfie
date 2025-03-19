import React from 'react';
import '../css/App.css';

function Button({ text, alt, onClick }) {
  return (
    <button className='btn-main rounded shadow-sm m-2 w-100 text-nowrap px-0' onClick={onClick} alt={alt}>
      {text}
    </button>
  );
}

export default Button;