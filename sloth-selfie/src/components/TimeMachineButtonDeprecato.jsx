import React, { useState, useEffect, useCallback } from 'react';
import '../styles/TimeMachine.css';
import iconTimeMachine from '../assets/icons/time-machine.svg';
import { useIsDesktop, useIsMobileLandscape } from '../utils/utils';

import TimeMachinePopup from './TimeMachinePopup';

const TimeMachineButton = () => {
    const isDesktop = useIsDesktop();
    const isMobileLandscape = useIsMobileLandscape();
    
    const [machineOpen, setMachineOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    const updatePosition = useCallback(() => {
        if (!isDesktop) {
            const initialX = window.innerWidth * 0.8;
            const initialY = window.innerHeight * 0.8;
            setPosition({ x: initialX, y: initialY });
        } else {
            setPosition({ x: window.innerWidth * 0.9, y: window.innerHeight * 0.03 });
        }
    }, [isDesktop]);

    const toggleTimeMachine = () => {
        setMachineOpen(prevState => !prevState);
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        setStartPosition({ x: touch.clientX, y: touch.clientY });
        setIsDragging(false);
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        
        // Calculate delta for better performance
        const deltaX = touch.clientX - startPosition.x;
        const deltaY = touch.clientY - startPosition.y;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            setIsDragging(true);

            setPosition(prevPos => ({
                x: prevPos.x + deltaX,
                y: prevPos.y + deltaY,
            }));

            setStartPosition({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleTouchEnd = (e) => {
        if (!isDragging) toggleTimeMachine();
    };

    useEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [updatePosition]);

    return (
        <>
            <div className='time-machine-container' style={{ left: `${position.x}px` , top: `${position.y}px`}}>
                <button
                    className="time-machine-button"
                    onTouchStart={isMobileLandscape ? handleTouchStart : null}
                    onTouchMove={isMobileLandscape ? handleTouchMove : null}
                    onTouchEnd={isMobileLandscape ? handleTouchEnd : null}
                    onClick={!isMobileLandscape ? toggleTimeMachine : null} // Enable click on desktop
                    style={{ touchAction: 'none' }}
                >
                <img src={iconTimeMachine} alt="icon" className="icon" />
                </button>
            </div>
            {machineOpen && <TimeMachinePopup setMachineOpen={setMachineOpen}/>}
        </>
    );
};

export default TimeMachineButton;
