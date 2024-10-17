import React, { useEffect, useContext } from 'react';
import { useState } from 'react';
import iconDark from './media/SlothDark.svg';
import iconLight from './media/SlothLight.svg';
import { StyleContext } from './StyleContext';
import PomodoroTimer from './PomodoroTimer';
import ReactDOM from 'react-dom';
import { Route } from 'react-router-dom';

function PomodoroFunction() {
    const { updateStyles, updateIcon } = useContext(StyleContext);

    const [choiceSelection, setChoiceSelection] = useState('0');

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

    const startPomodoro = (defaultStart) => {
        if (!defaultStart) {
            if (textStudio === '' || textBreak === '' || textCycles === '' || textTotal === ''
                || isNaN(textStudio) || isNaN(textBreak) || isNaN(textCycles) || isNaN(textTotal)) {
                alert("Please enter valid Pomodoro settings.");
                return;
            }

            if (parseInt(textTotal) !== (parseInt(textStudio) + parseInt(textBreak)) * parseInt(textCycles)) {
                alert("The total time doesn't match the study and break time and the number of cycles.");
                return;
            }
        }

        const pomodoro = document.getElementById('pomodoro');
        const selectionPomodoro = document.getElementById('select-pomodoro');
        if (pomodoro && selectionPomodoro) {
            pomodoro.style.display = 'flex';
            selectionPomodoro.style.display = 'none';
        } else {
            console.error('Element with ID "pomodoro" or "select-pomodoro" not found.');
        }
    };

    const handleChoiceSelection = (type) => {
        setChoiceSelection(type);
    };

    const selectChoice = () => {
        const selectionPomodoroSettings = document.getElementById('selection-pomodoro-settings');
        if (choiceSelection === 1) {
            const pomodoroTimersOptions = document.getElementById('pomodoro-timers-options');
            const btnStart = document.getElementById('btn-tomato-start');
            const btnQS = document.getElementById('btn-tomato-QS');
            const btnBack = document.getElementById('btn-back');

            if (pomodoroTimersOptions && btnStart && btnQS && btnBack) {
                pomodoroTimersOptions.style.display = 'block';
                btnStart.style.display = 'block';
                btnQS.style.display = 'none';
                btnBack.style.display = 'block';
            } else {
                console.error('Element with ID "pomodoro-timers-options", "btnQS", "btnBack"  or "btn-tomato-start" not found.');
            }
        } else if (choiceSelection === 2) {
            const pomodoroTotalTimeOption = document.getElementById('pomodoro-total-time-option');
            const btnQS = document.getElementById('btn-tomato-QS');


            if (pomodoroTotalTimeOption && btnQS) {
                pomodoroTotalTimeOption.style.display = 'block';
                btnQS.style.display = 'none';
                
            }
            else {
                console.error('Element with ID "pomodoro-total-time-option" not found.');
            }
        } else {
            alert("Please select an option.");
        }

        if (selectionPomodoroSettings && (choiceSelection === 1 || choiceSelection === 2)) {
            selectionPomodoroSettings.style.display = 'none';
        }
    };

    const selectionSuggestedPomodoro = (type) => {
        if (type === 1) {
            setTextStudio(timeStudySuggest1);
            setTextBreak(timeBreakSuggest1);
            setTextCycles(numberCyclesSuggest1);
            setTextTotal(timeTotalSuggest1);
        }
        else if (type === 2) {
            setTextStudio(timeStudySuggest2);
            setTextBreak(timeBreakSuggest2);
            setTextCycles(numberCyclesSuggest2);
            setTextTotal(timeTotalSuggest2);
        }
    };

    const backPage = () => {
        window.location.href = '/';
    };

    const backSelection = () => {
        const selectionPomodoroSettings = document.getElementById('selection-pomodoro-settings');
        const pomodoroTimersOptions = document.getElementById('pomodoro-timers-options');
        const pomodoroTotalTimeOption = document.getElementById('pomodoro-total-time-option');
        const btnStart = document.getElementById('btn-tomato-start');
        const btnQS = document.getElementById('btn-tomato-QS');
        const btnBack = document.getElementById('btn-back');
        const suggestedCyclesDiv = document.getElementById('suggested-cycles-div');

        if (selectionPomodoroSettings && pomodoroTimersOptions && pomodoroTotalTimeOption && btnStart && btnQS && btnBack && suggestedCyclesDiv) {
            selectionPomodoroSettings.style.display = 'block';
            pomodoroTimersOptions.style.display = 'none';
            pomodoroTotalTimeOption.style.display = 'none';
            btnStart.style.display = 'none';
            btnQS.style.display = 'block';
            btnBack.style.display = 'none';
            suggestedCyclesDiv.style.display = 'none';
        } else {
            console.error('Element with ID "selection-pomodoro-settings", "pomodoro-timers-options", "pomodoro-total-time-option", "btnQS", "btnBack" or "btn-tomato-start" not found.');
        }

        setTextBreak(5);
        setTextCycles(5);
        setTextStudio(30);
        setTextTotal(175);
        setChoiceSelection('0');
    };
            

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
        const btnQS = document.getElementById('btn-tomato-QS');
        const btnBack = document.getElementById('btn-back');
        const btnBackTotalTimeOne = document.getElementById('btn-back-total-time-one');

        console.log(suggestedCyclesDiv, btnTomatoStart);
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

        if (btnQS && btnBack && btnBackTotalTimeOne) {
            btnQS.style.display = 'none';
            btnBack.style.display = 'block';
            btnBackTotalTimeOne.style.display = 'none';
        } else {
            console.error('Element with ID "btn-tomato-QS", "btn-back" or "btn-back-total-time-one" not found.');
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

        setTextBreak('');
        setTextCycles('');
        setTextStudio('');
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
        <div className='div-pomodoro'>
            <div id="select-pomodoro" className="select-pomodoro">
                <h2>Select a Pomodoro and <br/>start your learning session</h2>
                <div id='selection-pomodoro-settings' className='selection-pomodoro-settings'>
                    <p>Chouse the settings of your Pomodoro study session</p>
                    <button className='settings-choice' onClick={() => handleChoiceSelection(1)} >Set the number of cycles and their duration</button>
                    <button className='settings-choice' onClick={() => handleChoiceSelection(2)}>Set the total time of your studying session</button>
                    <div className='divBtn'>
                        <button className='btn btn-tomato' onClick={backPage}>Back</button>
                        <botton className='btn btn-tomato' onClick={selectChoice}>Select</botton>
                    </div>
                </div>
                <div id='pomodoro-timers-options' className="pomodoro-timers-options">
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
                <div id='pomodoro-total-time-option' className="pomodoro-total-time-option">
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
                        <div className='divBtn'>
                            <button id='btn-back-total-time-one' className='btn btn-tomato' onClick={backSelection}>Back</button>
                            <button className='btn btn-tomato' onClick={getCycles}>Calculate cycles</button>
                        </div>
                        <div id='suggested-cycles-div' className='suggested-cycles-div'>
                            <p>Select one of the suggested Pomodoro</p>
                            <button className='suggested-cycles' onClick={()=>selectionSuggestedPomodoro(1)}>
                                <p>Study time: {timeStudySuggest1} minutes</p>
                                <p>Break time: {timeBreakSuggest1} minutes</p>
                                <p>Cycles number: {numberCyclesSuggest1}</p>
                                <p>Total time: {timeTotalSuggest1} minutes</p>
                            </button>
                            <button className='suggested-cycles' onClick={()=>selectionSuggestedPomodoro(2)}>
                                <p>Study time: {timeStudySuggest2} minutes</p>
                                <p>Break time: {timeBreakSuggest2} minutes</p>
                                <p>Cycles number: {numberCyclesSuggest2}</p>
                                <p>Total time: {timeTotalSuggest2} minutes</p>
                            </button>
                        </div>
                    </div>
                </div>
                <div className='divBtn'>
                    <button id='btn-back' className='btn btn-tomato btn-back' onClick={backSelection}>Back</button>
                    <button id='btn-tomato-start' className='btn btn-tomato btn-tomato-start' onClick={()=>startPomodoro(false)}>Let's get started</button>
                    <botton id='btn-tomato-QS' className='btn btn-tomato' onClick={()=>startPomodoro(true)}>Quick Start</botton>
                </div>
            </div>

            <div id='pomodoro' className="pomodoro">
                <PomodoroTimer
                    timeStudio={textStudio}
                    timeBreak={textBreak}
                    numberCycles={textCycles}
                    timeTotal={textTotal}
                />
            </div>
        </div>
    );
}

export default PomodoroFunction;