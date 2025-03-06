import React from 'react';

function Button({ text, icon, alt }) {
  return (
    <button className='btn btn-outline-dark rounded shadow-sm'>
      {icon && < img src={icon} alt={alt} className='icon-up' />}
      {text}
    </button>
  );
}

export default Button;