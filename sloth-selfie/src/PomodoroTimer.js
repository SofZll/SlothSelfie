import React, {useState, useEffect} from 'react';
import './css/Pomodoro.css';
import iconYoutube from './media/youtube.svg';
import iconSpotify from './media/spotify.svg';
import SpotifySearch from './Spotify';
import Youtube from './Youtube';
import iconPlay from './media/play.svg';
import iconStop from './media/stop.svg';
import iconReset from './media/reset.svg';
import iconEdit from './media/edit.svg';
import iconSkip from './media/skip.svg';
import iconCrossDark from './media/crossDark.svg';
import iconCross from './media/cross.svg';
import iconAdd from './media/add.svg';
import iconStats from './media/stats.svg';
import iconShare from './media/shareDark.svg';
import iconWhatsApp from './media/whatsapp.svg';
import iconTelegram from './media/telegram.svg';
import CopyableId from './copyableId';
import { stringTime, pomodoroPlay, passingTime, initDataPomodoro, addCycle, skipTime, resetTime, editDataPomodoro } from './pomodoroUtils';
//import io from 'socket.io-client';




function PomodoroTimer({timeStudio, timeBreak, numberCycles, timeTotal}) {
    const [platformMusic, setPlatformMusic] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [soundAudio, setSoundAudio] = useState('./media/meow.mp3');
    
    const [sending, setSending] = useState(false);
    const [inShare, setInShare] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [sessionCode, setSessionCode] = useState('123456');
    const [guestCode, setGuestCode] = useState('');
    const encodedMessage = encodeURIComponent('Hi! Join my Pomodoro session with the code: '+ {sessionCode});


    //const port = process.env.PORT || 8000;
    //const socket = io('http://localhost:'+{port}+'/pomodoro');

    

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
        studioTimeTotal: 0,
    });

    const [editData, setEditData] = useState({
        cycles: 5,
        studioTime: 30*60,
        breakTime: 5*60,
        totalTime: (dataPomodoro.cycles*(dataPomodoro.studioTime+dataPomodoro.breakTime))/60,
    });

    const [playTomato, setPlayTomato] = useState(false);
    const [stringPrintTime, setStringPrintTime] = useState(stringTime(dataPomodoro.timeLeft));

    const updateEditData = (field, value) => {
        setEditData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    const updateTot = () => {
        updateEditData('totalTime', ((Number(editData.studioTime) + Number(editData.breakTime)) * Number(editData.cycles)));
    }

    useEffect(() => {
        updateTot();
    }, [editData.studioTime, editData.breakTime, editData.cycles]);

    useEffect(() => {
        initDataPomodoro (setDataPomodoro, numberCycles, timeStudio*60, timeBreak*60);
        updateEditData('cycles', numberCycles);
        updateEditData('studioTime', timeStudio);
        updateEditData('breakTime', timeBreak);
        updateEditData('totalTime', timeTotal);
    }, [numberCycles, timeStudio, timeBreak]);

    const backPage = () => {
        //saveData(dataPomodoro);
        window.location.href = '/pomodoro';
    }

    useEffect(() => { 
        if (playTomato && dataPomodoro.cyclesLeft > 0) {
            const timer = setTimeout(() => {
                passingTime(dataPomodoro, setDataPomodoro, setPlayTomato);
            }, 1000);
    
            return () => clearTimeout(timer);
        }
    }, [dataPomodoro, playTomato]);

    useEffect(() => {
        setStringPrintTime(stringTime(dataPomodoro.timeLeft));
    }, [dataPomodoro.timeLeft]);

    const settingShare = (value) => {
        setIsHost(value);
        setInShare(true);

    }

    const exitShare = () => {
        setInShare(false);
        setIsHost(true);
    }
    

    return (
        <div className="pomodoro-timer">

            {sending && (
                <div className="send-popup">
                    {!inShare ? (
                        <>
                            <button className='btnClose' onClick={() => setSending(false)}>
                                <img src={iconCross} alt="Close" className='iconCross'/>
                            </button>
                            <h2>Share your Pomodoro</h2>
                            <p>Send the code to your friend to join your Pomodoro session</p>
                            <div className="divCode">
                                <p>Code: </p>
                                <CopyableId id={sessionCode}/>
                            </div>
                            <div className="divBtn">
                                <a href={`https://wa.me/?text=${encodedMessage}`} target="_blank" rel="noopener noreferrer">
                                    <img src={iconWhatsApp} alt="WhatsApp" className='iconWhatsApp'/>
                                </a>
                                <a href={`https://t.me/share/url?url=${encodedMessage}`} target="_blank" rel="noopener noreferrer">
                                    <img src={iconTelegram} alt="Telegram" className='iconTelegram'/>
                                </a>
                            </div>
                            <button className='btn' onClick={() => settingShare(false)}>Start session</button>
                            <hr/>
                            <p>Get in a Pomodoro room</p>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <label>Code:
                                    <input type="text" value={guestCode} onChange={(e) => setGuestCode(e.target.value)} required/>
                                </label>
                                <br/>
                                <button className="btn" type="submit" onClick={() => settingShare(true)}>Join</button>
                            </form>
                        </>
                    ) : (
                        <div style={{maxHeight: "600px"}}>
                            <h2>Welcome in the room </h2>
                            <CopyableId id={(isHost ? (guestCode) : (sessionCode))}/>
                            <div className="divBtn">
                                <a href={`https://wa.me/?text=${(isHost ? (guestCode) : (sessionCode))}`} target="_blank" rel="noopener noreferrer">
                                    <img src={iconWhatsApp} alt="WhatsApp" className='iconWhatsApp'/>
                                </a>
                                <a href={`https://t.me/share/url?url=${(isHost ? (guestCode) : (sessionCode))}`} target="_blank" rel="noopener noreferrer">
                                    <img src={iconTelegram} alt="Telegram" className='iconTelegram'/>
                                </a>
                            </div>
                            <button className='btn' onClick={() => exitShare()}>End session</button>
                        </div>
                    )}
                    
                </div>
            )}

            {isEditing && (
                <div className="edit-popup">
                    <button className='btnClose' onClick={() => setIsEditing(false)}>
                        <img src={iconCross} alt="Close" className='iconCross'/>
                    </button>
                    <h2>Edit your Pomodoro</h2>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label>Study time:
                            <input type="number" value={editData.studioTime} onChange={(e) => updateEditData('studioTime', parseInt(e.target.value))} min={0} step={1}/>
                        </label>
                        <label>Break time: 
                            <input type="number" value={editData.breakTime} onChange={(e) => updateEditData('breakTime', parseInt(e.target.value))} min={0} step={1}/>
                        </label>
                        <label>N° Cycles: 
                            <input type="number" value={editData.cycles} onChange={(e) => updateEditData('cycles', parseInt(e.target.value))} min={0} step={1}/>
                        </label>
                        <p>Time total: {isNaN(editData.totalTime) ? ("___") : (editData.totalTime)} minutes</p>
                        <button className="btn" type="submit" onClick={() => editDataPomodoro(editData.cycles, editData.studioTime*60, editData.breakTime*60, dataPomodoro, setDataPomodoro, setIsEditing, setPlayTomato)}>Save</button>
                    </form>
                </div>
            )}
            
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
                ) : ( platformMusic === 1 ? 
                    <Youtube setPlatformMusic = {setPlatformMusic}/> 
                : <SpotifySearch setPlatformMusic = {setPlatformMusic}/>
                )}
            </div>

            <div className="pomodoro-container">

                {dataPomodoro.done ? (
                    <p>Congratulation! <br/> You have studied for {stringTime(dataPomodoro.studioTimeTotal)} minutes</p>
                ) : (
                    (dataPomodoro.notStartedYet ? (
                        <p>Let's start the Pomodoro session</p>
                    ) : (
                        <p>You still have {stringPrintTime} {dataPomodoro.isStudioTime ? ("to study") : ("left in your break")}</p>
                    ))
                )}

                <div className='animation'>

                </div>

                {dataPomodoro.done ? (
                    <p>Reset or choose a now Pomodoro</p>
                ) : (
                    (dataPomodoro.notStartedYet ? (
                        <p>Press play to start</p>
                    ) : (
                        <p>Cycle {dataPomodoro.cycles-dataPomodoro.cyclesLeft+1} out of {dataPomodoro.cycles}</p>
                    ))
                )}
                
                <div className='divBtn'>
                    <button className='btnSettingTomato' onClick={() => setIsEditing(true)}>
                        <img src={iconEdit} alt="Edit" className='iconEdit'/>
                    </button>
                    <button className='btnSettingTomato' onClick={() => resetTime (dataPomodoro, setDataPomodoro, setPlayTomato)}>
                        <img src={iconReset} alt="Reset" className='iconReset'/>
                    </button>

                    {dataPomodoro.done ? (
                        <button className='btnSettingTomato' onClick={() => backPage()}>
                            <img src={iconCrossDark} alt='exit' className='iconCross'/>
                        </button>
                    ) : (
                        <button className='btnSettingTomato' onClick={() => pomodoroPlay (setPlayTomato, playTomato, dataPomodoro, setDataPomodoro)}>
                            {playTomato ? (<img src={iconStop} alt="stop" className='iconStop'/>) : (<img src={iconPlay} alt="Play" className='iconPlay'/>)}
                        </button>
                    )}

                    {dataPomodoro.done ? (
                        <button className='btnSettingTomato' onClick={() => addCycle (dataPomodoro, setDataPomodoro)}>
                            <img src={iconAdd} alt="Add" className='iconAdd'/>
                        </button>
                    ) : (
                        <button className='btnSettingTomato' onClick={() => skipTime (dataPomodoro, setDataPomodoro, setPlayTomato)}>
                            <img src={iconSkip} alt="Skip" className='iconSkip'/>
                        </button>
                    )}
                </div>
            </div>

            <div className="stats-container">
                <div className='divBtn'>
                    <button className='btnStats'>
                        <img src={iconStats} alt="Stats" className='iconStats'/>
                    </button>
                    <button className='btnStats' onClick={() => setSending(true)}>
                        <img src={iconShare} alt="Share" className='iconShare'/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PomodoroTimer;