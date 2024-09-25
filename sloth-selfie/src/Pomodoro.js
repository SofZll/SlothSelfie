import React, { useEffect} from 'react';

function PomodoroFunction() {
    // change style page onload document
    useEffect(() => {
        const header = document.querySelector('.App-header');
        const h1 = document.querySelector('h1');
        if (header) header.classList.add('light-background');
        else console.error('Header not found');
        if (h1) h1.classList.add('dark-h1');

        document.body.classList.add('light-background');

        return () => {
        if (header) header.classList.remove('light-background');
        if (h1) h1.classList.remove('dark-h1');
        document.body.classList.remove('light-background');
        };
    }, []);
    
    return (
        <div className="pomodoro">
            <h2>Pomodoro Timer</h2>
            <p>Welcome to your Pomodoro study session!</p>
        </div>
        
    );
}

export default PomodoroFunction;