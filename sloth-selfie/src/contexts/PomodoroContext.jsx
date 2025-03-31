import React, { createContext, useContext, useState }  from 'react';

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {

    const [settingsPomodoro, setSettingsPomodoro] = useState({
        studyTime: 30*60,
        breakTime: 5*60,
        cycles: 5,
        additionalCycles: 0
    });

    const [pomodoro, setPomodoro] = useState({
        _id: '',
        user: '',
        sharedWith: [],
        timeLeft: 30*60,
        cyclesLeft: 5,
        isStudyTime: true,
        started: false,
        finished: false,
        studiedTime: 0,
    });

    const increasePomodoroTime = () => {
        if (pomodoro.isStudyTime) {
            if (pomodoro.timeLeft <= 0) {
                setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.breakTime, cyclesLeft: pomodoro.cyclesLeft - 1, isStudyTime: false, studiedTime: pomodoro.studiedTime + 1, started: true });
                if(pomodoro.cyclesLeft === 0) setPomodoro({ ...pomodoro, finished: true });
            }
            else setPomodoro({ ...pomodoro, timeLeft: pomodoro.timeLeft - 1, studiedTime: pomodoro.studiedTime + 1, started: true });
        } else {
            if (pomodoro.timeLeft <= 0) setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime, isStudyTime: true });
            else setPomodoro({ ...pomodoro, timeLeft: pomodoro.timeLeft - 1 });
        }
    }

    const addCycle = () => {
        setSettingsPomodoro({ ...settingsPomodoro, additionalCycles: settingsPomodoro.additionalCycles + 1 });
        setPomodoro({ ...pomodoro, cyclesLeft: pomodoro.cyclesLeft + 1, finished: false });
    }

    const resetPomodoro = () => {
        const { studyTime, cycles } = settingsPomodoro;
        setSettingsPomodoro({ ...settingsPomodoro, additionalCycles: 0 });

        setPomodoro({
            ...pomodoro,
            timeLeft: studyTime,
            cyclesLeft: cycles,
            isStudyTime: true,
            finished: false
        });
    }

    const newPomodoro = () => {
        setPomodoro({
            _id: '',
            user: '',
            sharedWith: [],
            timeLeft: settingsPomodoro.studyTime,
            cyclesLeft: settingsPomodoro.cycles,
            isStudyTime: true,
            started: false,
            finished: false,
            studiedTime: 0,
        });
    }

    const editSettingsPomodoro = (studyTime, breakTime, cycles) => {
        if (settingsPomodoro.cycles - pomodoro.cyclesLeft > cycles) setPomodoro({ ...pomodoro, timeLeft: studyTime, cyclesLeft: cycles, isStudyTime: true, finished: true });
        else {
            setPomodoro({ ...pomodoro, cyclesLeft: cycles - (settingsPomodoro.cycles - pomodoro.cyclesLeft) });

            if (pomodoro.isStudyTime) {
                if (settingsPomodoro.studyTime - pomodoro.timeLeft > studyTime) {
                    setPomodoro({ ...pomodoro, timeLeft: breakTime, cyclesLeft: pomodoro.cyclesLeft - 1, isStudyTime: false });
                    if(pomodoro.cyclesLeft === 0) setPomodoro({ ...pomodoro, finished: true });
                }
                else setPomodoro({ ...pomodoro, timeLeft: studyTime - (settingsPomodoro.studyTime - pomodoro.timeLeft) });
            } else {
                if (settingsPomodoro.breakTime - pomodoro.timeLeft > breakTime) setPomodoro({ ...pomodoro, timeLeft: studyTime, isStudyTime: true });
                else setPomodoro({ ...pomodoro, timeLeft: breakTime - (settingsPomodoro.breakTime - pomodoro.timeLeft) });
            }
        }

        setSettingsPomodoro({ studyTime, breakTime, cycles, additionalCycles: 0 });
    }

    const skipTime = () => {
        if (pomodoro.isStudyTime) {
            if(pomodoro.cyclesLeft - 1 === 0) setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime, isStudyTime: true, started: true, finished: true });
            else setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.breakTime, cyclesLeft: pomodoro.cyclesLeft - 1, isStudyTime: false, started: true });
        } else setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime, isStudyTime: true });
    }

    return (
        <PomodoroContext.Provider value={{ pomodoro, setPomodoro, settingsPomodoro, setSettingsPomodoro, increasePomodoroTime, addCycle, resetPomodoro, newPomodoro, editSettingsPomodoro, skipTime }}>
            {children}
        </PomodoroContext.Provider>
    );
}

export const usePomodoro = () => useContext(PomodoroContext);