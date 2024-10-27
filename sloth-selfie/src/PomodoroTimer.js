import React, {useState, useEffect} from 'react';
import './css/Pomodoro.css';
import iconYoutube from './media/youtube.svg';
import iconSpotify from './media/spotify.svg';
import SpotifySearch from './Spotify';
import Youtube from './Youtube';
import iconArrow from './media/leftBackArrow.svg';
import iconPlay from './media/play.svg';
import iconStop from './media/stop.svg';
import iconReset from './media/reset.svg';
import iconEdit from './media/edit.svg';
import iconSkip from './media/skip.svg';
import iconCross from './media/cross.svg';
import iconAdd from './media/add.svg';
import { stringTime, pomodoroPlay, handlePodomoroTimeChange, passingTime, initDataPomodoro, addCycle, skipTime, resetTime } from './pomodoroUtils';



function PomodoroTimer({timeStudio, timeBreak, numberCycles, timeTotal}) {
    const [platformMusic, setPlatformMusic] = useState(0);
    const [soundAudio, setSoundAudio] = useState('./media/meow.mp3');

    const [dataPomodoro, setDataPomodoro] = useState({
        timeLeft: 30*60,
        cyclesLeft: 5,
        cycles: 5,
        isStudioTime: true,
        studioTime: 30*60,
        breakTime: 5*60,
        notStartedYet: true,
        done: false,
        addedCycles: 0,
        skippedCycles: 0,
      });

    const [playTomato, setPlayTomato] = useState(false);
    const [stringPrintTime, setStringPrintTime] = useState(stringTime(dataPomodoro.timeLeft));

    useEffect(() => {
        initDataPomodoro (setDataPomodoro, numberCycles, timeStudio*60, timeBreak*60);
    }, []);

    const backPage = () => {
        //saveData(dataPomodoro);
        window.location.href = '/pomodoro';
    }

    useEffect(() => { 
        if (playTomato && dataPomodoro.cyclesLeft > 0) {
            const timer = setTimeout(() => {
                passingTime(dataPomodoro, setDataPomodoro, setPlayTomato, setStringPrintTime);
            }, 1000);
    
            return () => clearTimeout(timer);
        }
    }, [dataPomodoro, playTomato]);

    return (
        <div className="pomodoro-timer">
            
            <div className="song-container">
                {platformMusic === 0 ? (
                <div className='divBtn'>
                    <button className='btnMusic' onClick={() => setPlatformMusic(1)}>
                        <img src={iconYoutube} alt="Youtube" className='iconYoutube'/>
                    </button>
                    <button className='btnMusic' onClick={() => setPlatformMusic(2)}>
                        <img src={iconSpotify} alt="Spotify" className='iconSpotify'/>
                    </button>
                </div>
                ) : (
                <>
                    <button className='btnBack' onClick={() => setPlatformMusic(0)}>
                        <img src={iconArrow} alt="Back" className='icon'/>
                    </button>
                    {platformMusic === 1 ? <Youtube /> : <SpotifySearch />}
                </>
                )}
            </div>
            <div className="pomodoro-container">

                {dataPomodoro.done ? (
                    <p>Congratulation! <br/> You have finished your studing session</p>
                ) : (
                    (dataPomodoro.notStartedYet ? (
                        <p>Let's start the Pomodoro session</p>
                    ) : (
                        <p>You still have {stringPrintTime} {dataPomodoro.isStudioTime ? ("to study") : ("left in your break")}</p>
                    ))
                )}

                <div className='anamation'>
                </div>

                {dataPomodoro.done ? (
                    <p>Reset or choose a now Pomodoro</p>
                ) : (
                    (dataPomodoro.notStartedYet ? (
                        <p>Press play to start</p>
                    ) : (
                        <p>Cycle {dataPomodoro.cycles-dataPomodoro.cyclesLeft} out of {dataPomodoro.cycles}</p>
                    ))
                )}
                
                <div className='divBtn'>
                    <button className='btnSettingTomato'>
                        <img src={iconEdit} alt="Edit" className='iconEdit'/>
                    </button>
                    <button className='btnSettingTomato' onClick={() => resetTime (dataPomodoro, setDataPomodoro, setStringPrintTime)}>
                        <img src={iconReset} alt="Reset" className='iconReset'/>
                    </button>

                    {dataPomodoro.done ? (
                        <button className='btnSettingTomato' onClick={() => backPage()}>
                            <img src={iconCross} alt='exit' className='iconCross'/>
                        </button>
                    ) : (
                        <button className='btnSettingTomato' onClick={() => pomodoroPlay (setPlayTomato, playTomato, dataPomodoro, setDataPomodoro)}>
                            {playTomato ? (<img src={iconStop} alt="stop" className='iconStop'/>) : (<img src={iconPlay} alt="Play" className='iconPlay'/>)}
                        </button>
                    )}

                    {dataPomodoro.done ? (
                        <button className='btnSettingTomato' onClick={() => addCycle (dataPomodoro, setDataPomodoro, setStringPrintTime)}>
                            <img src={iconAdd} alt="Add" className='iconAdd'/>
                        </button>
                    ) : (
                        <button className='btnSettingTomato' onClick={() => skipTime (dataPomodoro, setDataPomodoro, setStringPrintTime)}>
                            <img src={iconSkip} alt="Skip" className='iconSkip'/>
                        </button>
                    )}
                </div>
            </div>
            <div className="stats-container">
            </div>
        </div>
    );
}

export default PomodoroTimer;