import React, { createContext, useContext, useState }  from 'react';

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {

    const [settingsPomodoro, setSettingsPomodoro] = useState({
        studyTime: 60*30,
        breakTime: 60*5,
        cycles: 5,
        additionalCycles: 0
    });

    const [pomodoro, setPomodoro] = useState({
        _id: '',
        user: '',
        sharedWith: [],
        timeLeft: 60,
        cyclesLeft: 5,
        isStudyTime: true,
        started: false,
        finished: false,
        studiedTime: 0,
    });

    const [play, setPlay] = useState(false);

    const [animation, setAnimation] = useState({
        reset: false,
        pencilTime: `${60*30}s`,
        lineTime: `${(60*30*0.8)}s`,
        delayGo: `${(60*30*0.2)}s`,
        delayBack: `${(60*30*0.1)}s`,
    });

    const resetAnimation = (time) => {
        setAnimation({
            reset: true,
            pencilTime: `${time}s`,
            lineTime: `${(time*0.8)}s`,
            delayGo: `${(time*0.2)}s`,
            delayBack: `${(time*0.1)}s`,
        });
    }

    const editTimeAnimation = (time) => {
        setAnimation({
            reset: false,
            pencilTime: `${time}s`,
            lineTime: `${(time*0.8)}s`,
            delayGo: `${(time*0.2)}s`,
            delayBack: `${(time*0.1)}s`,
        });
    }

    const increasePomodoroTime = () => {
        if (pomodoro.timeLeft <= 0) {
            if (pomodoro.isStudyTime) {
                setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.breakTime, cyclesLeft: pomodoro.cyclesLeft - 1, isStudyTime: false, studiedTime: pomodoro.studiedTime + 1, started: true });
                editTimeAnimation(settingsPomodoro.breakTime);
                if(pomodoro.cyclesLeft === 0) setPomodoro({ ...pomodoro, finished: true });

            } else {
                setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime, isStudyTime: true });
                editTimeAnimation(settingsPomodoro.studyTime);
            }
            setPlay(false);

        } else setPomodoro({ ...pomodoro, timeLeft: pomodoro.timeLeft - 1, studiedTime: pomodoro.studiedTime + 1, started: true });
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

        resetAnimation(studyTime);
    }

    const newPomodoro = () => {
        setSettingsPomodoro({ studyTime: 60*30, breakTime: 60*5, cycles: 5, additionalCycles: 0 });

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

        resetAnimation(settingsPomodoro.studyTime);
    }

    const editSettingsPomodoro = (studyTime, breakTime, cycles) => {
        if (settingsPomodoro.cycles - pomodoro.cyclesLeft > cycles) {
            setPomodoro({ ...pomodoro, timeLeft: studyTime, cyclesLeft: cycles, isStudyTime: true, finished: true });
            setAnimation({ ...animation, reset: true });
        } else {
            setPomodoro({ ...pomodoro, cyclesLeft: cycles - (settingsPomodoro.cycles - pomodoro.cyclesLeft) });

            if (pomodoro.isStudyTime) {
                if (settingsPomodoro.studyTime - pomodoro.timeLeft > studyTime) {
                    setPomodoro({ ...pomodoro, timeLeft: breakTime, cyclesLeft: pomodoro.cyclesLeft - 1, isStudyTime: false });
                    setAnimation({ ...animation, reset: true });
                    if(pomodoro.cyclesLeft === 0) setPomodoro({ ...pomodoro, finished: true });
                }
                else setPomodoro({ ...pomodoro, timeLeft: studyTime - (settingsPomodoro.studyTime - pomodoro.timeLeft) });
            } else {
                if (settingsPomodoro.breakTime - pomodoro.timeLeft > breakTime) {
                    setPomodoro({ ...pomodoro, timeLeft: studyTime, isStudyTime: true });
                    setAnimation({ ...animation, reset: true });
                } else setPomodoro({ ...pomodoro, timeLeft: breakTime - (settingsPomodoro.breakTime - pomodoro.timeLeft) });
            }
        }

        setSettingsPomodoro({ studyTime, breakTime, cycles, additionalCycles: 0 });
        editTimeAnimation( pomodoro.isStudyTime ? studyTime : breakTime );
    }

    const skipTime = () => {
        if (pomodoro.isStudyTime) {
            if(pomodoro.cyclesLeft - 1 === 0) setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime, isStudyTime: true, started: true, finished: true });
            else setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.breakTime, cyclesLeft: pomodoro.cyclesLeft - 1, isStudyTime: false, started: true });
        } else setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime, isStudyTime: true });

        resetAnimation(pomodoro.isStudyTime ? settingsPomodoro.studyTime : settingsPomodoro.breakTime);
    }

    const skipBack = () => {
        if (pomodoro.isStudyTime) {
            if (pomodoro.timeLeft < settingsPomodoro.studyTime) setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime });
            else if (pomodoro.cyclesLeft === settingsPomodoro.cycles) setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime});
            else setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.breakTime, cyclesLeft: pomodoro.cyclesLeft + 1, isStudyTime: false});
        } else {
            if (pomodoro.timeLeft < settingsPomodoro.breakTime) setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.breakTime });
            else setPomodoro({ ...pomodoro, timeLeft: settingsPomodoro.studyTime, isStudyTime: true });
        }

        resetAnimation(pomodoro.isStudyTime ? settingsPomodoro.studyTime : settingsPomodoro.breakTime);
    }

    const [popUp, setPopUp] = useState({
        open: false,
        share: false,
        edit: false,
        calendar: false,
        music: false,
    })

    const resetPopUp = () => {
        setPopUp({
            open: false,
            share: false,
            edit: false,
            calendar: false,
            music: false,
        })
    }

    const [socketData, setSocketData] = useState({
        room: '',
        inShare: false,
        peopleInSession: 0,
    })

    return (
        <PomodoroContext.Provider
            value={{ play, setPlay, 
            pomodoro, setPomodoro, settingsPomodoro, setSettingsPomodoro, increasePomodoroTime, addCycle, resetPomodoro, newPomodoro, editSettingsPomodoro, skipTime, skipBack,
            animation, setAnimation, resetAnimation, editTimeAnimation,
            popUp, setPopUp, resetPopUp,
            socketData, setSocketData }}>
            {children}
        </PomodoroContext.Provider>
    );
}

export const usePomodoro = () => useContext(PomodoroContext);