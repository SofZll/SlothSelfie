import React from 'react';
import '../../styles/ClockAnimation.css';

const ClockAnimation = ({ animationDirection }) => {
    return (
        <div className={`clock-overlay ${animationDirection}`}>
            <div className='clock-container'>
                <div className='clock-face'>
                    <div className='hand hour-hand' />
                    <div className='hand minute-hand' />
                    <div className='clock-center' />
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`clock-mark ${i % 3 === 0 ? 'hour-mark' : 'minute-mark'}`}
                            style={{ transform: `rotate(${i * 30}deg)` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ClockAnimation;