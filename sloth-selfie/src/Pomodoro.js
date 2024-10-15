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

    const timeStudySuggest1 = '30';
    const [timeBreakSuggest1, setTimeBreakSuggest1] = useState('5');
    const [numberCyclesSuggest1, setNumberCyclesSuggest1] = useState('4');
    const [timeTotalSuggest1, setTimeTotalSuggest1] = useState('175');
    const timeStudySuggest2 = '30';
    const [timeBreakSuggest2, setTimeBreakSuggest2] = useState('5');
    const [numberCyclesSuggest2, setNumberCyclesSuggest2] = useState('3');
    const [timeTotalSuggest2, setTimeTotalSuggest2] = useState('175');


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

    const handleCSS = () => {
        const suggestedCyclesDiv = document.getElementById('suggested-cycles-div');
        const btnTomatoStart = document.getElementById('btn-tomato-start');

        console.log(suggestedCyclesDiv, btnTomatoStart); // Check if elements are null

        if (suggestedCyclesDiv) {
            suggestedCyclesDiv.style.display = 'flex';
        } else {
            console.error('Element with ID "suggested-cycles-div" not found.');
        }

        if (btnTomatoStart) {
            btnTomatoStart.style.display = 'block';
        } else {
            console.error('Element with ID "btn-tomato-start" not found.');
        }
    };

    const getMinutes = () => {
        let study = parseInt(textStudio);
        let breakTime = parseInt(textBreak);
        let cycles = parseInt(textCycles);

        if (isNaN(study) || study <= 0) {
            alert("Please enter a valid positive number for study time.");
            return;
        }

        if (isNaN(breakTime) || breakTime <= 0) {
            alert("Please enter a valid positive number for break time.");
            return;
        }

        if (isNaN(cycles) || cycles <= 0) {
            alert("Please enter a valid positive number for cycles.");
            return;
        }

        setTextTotal((breakTime + study) * cycles);
    };

    const getCycles = () => {

        let time = parseInt(textTotal);
        let study1 = parseInt(timeStudySuggest1);
        let study2 = parseInt(timeStudySuggest2);

        if (isNaN(time) || time <= 0) {
            alert("Please enter a valid positive number for total time.");
            return;
        }

        let cycles1 = Math.floor(time / 30);

        if (cycles1 <= 0) {
            alert("Please enter a bigger value for total time.");
            return;
        }
        else if (time - cycles1*study1 < cycles1*2) {
            cycles1--;
        }

        let breakTime1 = parseInt((time - cycles1*study1)/cycles1);
        let cycles2 = cycles1 + 1;
        let breakTime2 = parseInt((time - cycles2*study2)/cycles2);

        if (breakTime2 < 2) breakTime2 = 2;

        let total1 = (breakTime1 + study1) * cycles1;
        let total2 = (breakTime2 + study2) * cycles2;

        setTimeBreakSuggest1(breakTime1);
        setNumberCyclesSuggest1(cycles1);
        setTimeTotalSuggest1(total1);
        setTimeBreakSuggest2(breakTime2);
        setNumberCyclesSuggest2(cycles2);
        setTimeTotalSuggest2(total2);

        handleCSS();

    }

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
                <div className="pomodoro-timers-options">
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
                            <p>Select the number of study and break cycles</p>
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
                            <button className='btn' onClick={getMinutes}>calculate minutes</button>
                        </div>
                        <p>The selected total time is: {textTotal} minutes</p>
                    </div>
                </div>
                <div className="pomodoro-total-time-option">
                    <div className='input-total-div'>
                        <p>Enter the total time of your studing session</p>
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
                        
                        <button className='btn' onClick={getCycles}>calculate cycles</button>

                        <div id='suggested-cycles-div' className='suggested-cycles-div'>
                            <p>Select one of the suggested Pomodoro</p>
                            <button className='suggested-cycles'>
                                <p>Study time: {timeStudySuggest1} minutes</p>
                                <p>Break time: {timeBreakSuggest1} minutes</p>
                                <p>Cycles number: {numberCyclesSuggest1}</p>
                                <p>Total time: {timeTotalSuggest1} minutes</p>
                            </button>
                            <button className='suggested-cycles'>
                                <p>Study time: {timeStudySuggest2} minutes</p>
                                <p>Break time: {timeBreakSuggest2} minutes</p>
                                <p>Cycles number: {numberCyclesSuggest2}</p>
                                <p>Total time: {timeTotalSuggest2} minutes</p>
                            </button>
                        </div>
                    </div>
                </div>
                <button id='btn-tomato-start' className='btn btn-tomato-start'>Let's get started</button>
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