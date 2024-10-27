import { Howl } from 'howler';

export function stringTime (time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

export function tomatoPlay (setDataPomodoro, dataPomodoro, setPlayTomato, playTomato, setStringPrintTime) {
    if (dataPomodoro.ciclesLeft === 0) {
        handlePodomoroTimeChange('timeLeft', dataPomodoro.studioTime, setDataPomodoro);
        setStringPrintTime(stringTime(dataPomodoro.studioTime));
        handlePodomoroTimeChange('ciclesLeft', dataPomodoro.cicles, setDataPomodoro);
        setPlayTomato(false);
    } else {
        setPlayTomato(!playTomato);
    }
}

function soundFinish() {
  return new Howl({
    src: [require('./media/meow.mp3')],
    volume: 1.0,
  });
}

export function initDataPomodoro (setDataPomodoro, cicles, studioTime, breakTime) {
    handlePodomoroTimeChange('cicles', cicles, setDataPomodoro);
    handlePodomoroTimeChange('studioTime', studioTime, setDataPomodoro);
    handlePodomoroTimeChange('breakTime', breakTime, setDataPomodoro);
    handlePodomoroTimeChange('timeLeft', studioTime, setDataPomodoro);
    handlePodomoroTimeChange('ciclesLeft', cicles, setDataPomodoro);
}

export function handlePodomoroTimeChange (field, value, setDataPomodoro) {
    setDataPomodoro((prevDataPomodoro) => ({
        ...prevDataPomodoro,
        [field]: value
    }));
}

export function handleEdtiDataLeft (cicles, studioTime, breakTime, dataPomodoro, setDataPomodoro, setPlayTomato) {
    if (cicles < dataPomodoro.cicles) {
        const ciclesLeft = dataPomodoro.ciclesLeft - (dataPomodoro.cicles - cicles);
        if (ciclesLeft < 0) {
            handlePodomoroTimeChange('ciclesLeft', 0, setDataPomodoro);
            handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
            setPlayTomato(false);
        } else {
            handlePodomoroTimeChange('ciclesLeft', ciclesLeft, setDataPomodoro);
        }
    } else {
        handlePodomoroTimeChange('ciclesLeft', dataPomodoro.ciclesLeft + (cicles - dataPomodoro.cicles), setDataPomodoro);
    }

    if (dataPomodoro.ciclesLeft !== 0) {
        if (dataPomodoro.isStudioTime) {
            if (studioTime < dataPomodoro.studioTime) {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft - (dataPomodoro.studioTime - studioTime), setDataPomodoro);
                if (dataPomodoro.timeLeft <= 0) {
                    handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
                    handlePodomoroTimeChange('isStudioTime', false, setDataPomodoro);
                }
            } else {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft + (dataPomodoro.studioTime - studioTime), setDataPomodoro);
            }
        } else {
            if (breakTime < dataPomodoro.breakTime) {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft - (dataPomodoro.breakTime - breakTime), setDataPomodoro);
                if (dataPomodoro.timeLeft <= 0) {
                    handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
                    handlePodomoroTimeChange('isStudioTime', true, setDataPomodoro);
                }
            } else {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft + (dataPomodoro.breakTime - breakTime), setDataPomodoro);
            }
        }
    }
}

export function editDataPomodoro (cicles, studioTime, breakTime, dataPomodoro, setDataPomodoro) {
    handleEdtiDataLeft(cicles, studioTime, breakTime, dataPomodoro, setDataPomodoro);
    
    handlePodomoroTimeChange('cicles', cicles, setDataPomodoro);
    handlePodomoroTimeChange('studioTime', studioTime, setDataPomodoro);
    handlePodomoroTimeChange('breakTime', breakTime, setDataPomodoro);
}

export function passingTime (dataPomodoro, setDataPomodoro, setPlayTomato, setStringPrintTime) {
    if (dataPomodoro.timeLeft > 0) {
        handlePodomoroTimeChange('timeLeft', dataPomodoro.timeLeft - 1, setDataPomodoro);
        setStringPrintTime(stringTime(dataPomodoro.timeLeft));
    } else {
        soundFinish().play();
        if (dataPomodoro.isStudioTime) {
            if (dataPomodoro.ciclesLeft > 1) {
                handlePodomoroTimeChange('timeLeft', dataPomodoro.breakTime, setDataPomodoro);
                setStringPrintTime(stringTime(dataPomodoro.breakTime));
                handlePodomoroTimeChange('isStudioTime', false, setDataPomodoro);
            } else {
                handlePodomoroTimeChange('timeLeft', 0, setDataPomodoro);
                setStringPrintTime(stringTime(0));
            }
            handlePodomoroTimeChange('ciclesLeft', dataPomodoro.ciclesLeft - 1, setDataPomodoro);
        } else {
            handlePodomoroTimeChange('timeLeft', dataPomodoro.studioTime, setDataPomodoro);
            setStringPrintTime(stringTime(dataPomodoro.studioTime));
            handlePodomoroTimeChange('isStudioTime', true, setDataPomodoro);
        }
    }
}

