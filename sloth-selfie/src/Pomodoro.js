import React, { useEffect, useContext } from 'react';
import { useState } from 'react';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';

function PomodoroFunction() {
    const { updateStyles, updateIcon } = useContext(StyleContext);
    const [textStudio, setTextStudio] = useState('30');
    const [textBreak, setTextBreak] = useState('5');
    const [textCycles, setTextCycles] = useState('5');
    const [textTotal, setTextTotal] = useState('175');

    const handleInputChange = (e, type) => {
        switch (type) {
            case 1:
                setTextStudio(e.target.value);
                break;
            case 2:
                setTextBreak(e.target.value);
                break;
            case 3:
                setTextTotal(e.target.value);
                break;
            case 4:
                setTextCycles(e.target.value);
                break;
            default:
                break;
        }
    };

    // change style page onload document
    useEffect(() => {
        updateStyles(true);
        updateIcon(iconDark);

        return () => {
            updateStyles(false);
            updateIcon(iconLight);
        };
    }, [updateIcon, updateStyles]);

    return (
        <div>
            <div className="select-pomodoro">
                <h2>Select a Pomodoro and <br/>start your learning session</h2>
                <div className="pomodoro-options">
                    <div className="timers-option">
                        <p>Select the duration of your study and break cycles </p>
                        <div className='input-timer-div'>
                            <div className='input-studio-div'>
                                <label htmlFor="inputText">Study:</label>
                                <input
                                    type="text"
                                    id="inputText"
                                    value={textStudio}
                                    onChange={(e) => handleInputChange(e,1)}
                                    style={{ width: '65%', padding: '5px', marginTop: '5px' }}
                                />
                                <p>minuts</p>
                            </div>
                            <div className='input-break-div'>
                                <label htmlFor="inputText">Break:</label>
                                <input
                                    type="text"
                                    id="inputText"
                                    value={textBreak}
                                    onChange={(e) => handleInputChange(e,2)}
                                    style={{ width: '65%', padding: '5px', marginTop: '5px' }}
                                />
                                <p>minuts</p>
                            </div>
                        </div>
                        <div className='input-cycles-div'>
                            <p>Select the number of study  and break cycles</p>
                            <div className='total-time-div'>
                                <label htmlFor="inputText">Time:</label>
                                <input
                                    type="text"
                                    id="inputText"
                                    value={textTotal}
                                    onChange={(e) => handleInputChange(e,3)}
                                    style={{ width: '65%', padding: '5px', marginTop: '5px' }}
                                />
                                <p>minuts</p>
                            </div>
                            <button className='btn'>calculate cycles</button>
                            <div className='total-cycles-div'>
                                <label htmlFor="inputText">Cycles:</label>
                                <input
                                    type="text"
                                    id="inputText"
                                    value={textCycles}
                                    onChange={(e) => handleInputChange(e,4)}
                                    style={{ width: '65%', padding: '5px', marginTop: '5px' }}
                                />
                                <p>of study</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="pomodoro">
                <div className="song-container">

                </div>
                <div className="pomodoro-container">
                </div>
                <div className="stats-container">
                </div>
            </div>
        </div>
    );
}

export default PomodoroFunction;