import React from 'react';
import '../css/App.css';

//TODO RIMUOVI ALT
function Button({ text, ariaLabel, title, alt, onClick }) {
  return (
    <button className='btn-main rounded shadow-sm m-2 w-100 text-nowrap px-0' onClick={onClick} type='button' aria-label={ariaLabel} title={title} alt={alt}>
      {text}
    </button>
  );
}

export default Button;