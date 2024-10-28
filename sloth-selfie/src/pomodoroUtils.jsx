import { Howl } from 'howler';

export function stringTime (time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

export function tomatoPlay (setDataPomodoro, dataPomodoro, setPlayTomato, playTomato) {
    if (dataPomodoro.cyclesLeft === 0) {
        handlePodomoroTimeChange('timeLeft', dataPomodoro.studioTime, setDataPomodoro);
        handlePodomoroTimeChange('cyclesLeft', dataPomodoro.cycles, setDataPomodoro);
        handlePodomoroTimeChange('done', false, setDataPomodoro);
        handlePodomoroTimeChange('notStartedYet', true, setDataPomodoro);
        setPlayTomato(false);
    } else {
        if(dataPomodoro.notStartedYet) handlePodomoroTimeChange('notStartedYet', false, setDataPomodoro)
        setPlayTomato(!playTomato);
    }
}

export function pomodoroPlay (setPlayTomato, playTomato, dataPomodoro, setDataPomodoro) {
    if(dataPomodoro.notStartedYet) handlePodomoroTimeChange('notStartedYet', false, setDataPomodoro)

    setPlayTomato(!playTomato);
}

function soundFinish() {
  return new Howl({
    src: [require('./media/meow.mp3')],
    volume: 1.0,
  });
}

export function initDataPomodoro (setDataPomodoro, cycles, studioTime, breakTime) {
    handlePodomoroTimeChange('cycles', cycles, setDataPomodoro);
    handlePodomoroTimeChange('studioTime', studioTime, setDataPomodoro);
    handlePodomoroTimeChange('breakTime', breakTime, setDataPomodoro);
    handlePodomoroTimeChange('timeLeft', studioTime, setDataPomodoro);
    handlePodomoroTimeChange('cyclesLeft', cycles, setDataPomodoro);
}

export function handlePodomoroTimeChange (field, value, setDataPomodoro) {
    setDataPomodoro((prevDataPomodoro) => ({
        ...prevDataPomodoro,
        [field]: value
    }));
}

export function handleEdtiDataLeft (cycles, studioTime, breakTime, dataPomodoro, setDataPomodoro, setPlayTomato) {
    if (cycles < dataPomodoro.cycles) {
        const cyclesLeft = dataPomodoro.cyclesLeft - (dataPomodoro.cycles - cycles);
        if (cyclesLeft < 0) {
            handlePodomoroTimeChange('cyclesLeft', 0, setDataPomodoro);
            handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
            setPlayTomato(false);
        } else {
            handlePodomoroTimeChange('cyclesLeft', cyclesLeft, setDataPomodoro);
        }
    } else {
        handlePodomoroTimeChange('cyclesLeft', Number(dataPomodoro.cyclesLeft) + (cycles - dataPomodoro.cycles), setDataPomodoro);
        console.log(dataPomodoro.cyclesLeft);
    }

    if (dataPomodoro.cyclesLeft !== 0) {
        if (dataPomodoro.isStudioTime) {
            if (studioTime < dataPomodoro.studioTime) {
                const timeLeft = dataPomodoro.timeLeft - (dataPomodoro.studioTime - studioTime);
                if (timeLeft <= 0) {
                    handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
                    handlePodomoroTimeChange('isStudioTime', false, setDataPomodoro);
                    handlePodomoroTimeChange('cyclesLeft', dataPomodoro.cyclesLeft - 1, setDataPomodoro);
                } else {
                    handlePodomoroTimeChange('timeLeft', timeLeft, setDataPomodoro);
                }
            } else {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft + (studioTime - dataPomodoro.studioTime), setDataPomodoro);
            }
        } else {
            if (breakTime < dataPomodoro.breakTime) {
                const timeLeft = dataPomodoro.timeLeft - (dataPomodoro.breakTime - breakTime);
                if (timeLeft <= 0) {
                    handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
                    handlePodomoroTimeChange('isStudioTime', true, setDataPomodoro);
                } else {
                    handlePodomoroTimeChange('timeLeft', timeLeft, setDataPomodoro);
                }
            } else {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft + (breakTime - dataPomodoro.breakTime), setDataPomodoro);
            }
        }
    }
}

export function editDataPomodoro (cycles, studioTime, breakTime, dataPomodoro, setDataPomodoro, setIsEditing) {
    handleEdtiDataLeft(cycles, studioTime, breakTime, dataPomodoro, setDataPomodoro);
    
    handlePodomoroTimeChange('cycles', cycles, setDataPomodoro);
    handlePodomoroTimeChange('studioTime', studioTime, setDataPomodoro);
    handlePodomoroTimeChange('breakTime', breakTime, setDataPomodoro);

    setIsEditing(false);
}

export function skipTime (dataPomodoro, setDataPomodoro, setPlayTomato) {
    if (dataPomodoro.isStudioTime) {

        if (dataPomodoro.cyclesLeft > 1) {
            handlePodomoroTimeChange('timeLeft', dataPomodoro.breakTime, setDataPomodoro);
            handlePodomoroTimeChange('isStudioTime', false, setDataPomodoro);
        } else {
            handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
            handlePodomoroTimeChange('done', true, setDataPomodoro);
            setPlayTomato(false);
        }
        
    } else {
        handlePodomoroTimeChange('timeLeft', dataPomodoro.studioTime, setDataPomodoro);
        handlePodomoroTimeChange('cyclesLeft', dataPomodoro.cyclesLeft - 1, setDataPomodoro);
        handlePodomoroTimeChange('isStudioTime', true, setDataPomodoro);
    }
}

export function addCycle (dataPomodoro, setDataPomodoro) {
    handlePodomoroTimeChange('addedCycles', dataPomodoro.addedCycles + 1, setDataPomodoro);
    handlePodomoroTimeChange('cycles', dataPomodoro.cycles + 1, setDataPomodoro);
    handlePodomoroTimeChange('cyclesLeft', dataPomodoro.cyclesLeft + 1, setDataPomodoro);
    handlePodomoroTimeChange('timeLeft', dataPomodoro.breakTime, setDataPomodoro);
    handlePodomoroTimeChange('isStudioTime', false, setDataPomodoro);
    handlePodomoroTimeChange('done', false, setDataPomodoro);
}

export function resetTime (dataPomodoro, setDataPomodoro, setPlayTomato) {
    handlePodomoroTimeChange('timeLeft', dataPomodoro.studioTime, setDataPomodoro);
    handlePodomoroTimeChange('cyclesLeft', (dataPomodoro.cycles - dataPomodoro.addedCycles), setDataPomodoro);
    handlePodomoroTimeChange('cycles', dataPomodoro.cycles - dataPomodoro.addedCycles, setDataPomodoro);
    handlePodomoroTimeChange('done', false, setDataPomodoro);
    handlePodomoroTimeChange('notStartedYet', true, setDataPomodoro);
    handlePodomoroTimeChange('addedCycles', 0, setDataPomodoro);
    handlePodomoroTimeChange('isStudioTime', true, setDataPomodoro);
    setPlayTomato(false);
}

export function passingTime (dataPomodoro, setDataPomodoro, setPlayTomato) {
    if (dataPomodoro.timeLeft > 0) {
        handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft - 1, setDataPomodoro);
        handlePodomoroTimeChange('studioTimeTotal', dataPomodoro.studioTimeTotal + 1, setDataPomodoro);
    } else {
        soundFinish().play();
        if (dataPomodoro.isStudioTime) {
            if (dataPomodoro.cyclesLeft > 1) {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.breakTime, setDataPomodoro);
                handlePodomoroTimeChange('isStudioTime', false, setDataPomodoro);
            } else {
                handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
                handlePodomoroTimeChange('done', true, setDataPomodoro);
                setPlayTomato(false);
            }
        } else {
            handlePodomoroTimeChange('timeLeft', dataPomodoro.studioTime, setDataPomodoro);
            handlePodomoroTimeChange('cyclesLeft', dataPomodoro.cyclesLeft - 1, setDataPomodoro);
            handlePodomoroTimeChange('isStudioTime', true, setDataPomodoro);
        }
    }
}

