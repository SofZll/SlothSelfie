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
import { stringTime, pomodoroPlay, passingTime, initDataPomodoro, addCycle, skipTime, resetTime, editDataPomodoro, timerState } from './pomodoroUtils';
import io from 'socket.io-client';
import PomodoroAnimation from './PomodoroAnimation';




function PomodoroTimer({timeStudio, timeBreak, numberCycles, timeTotal}) {
    const [platformMusic, setPlatformMusic] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [soundAudio, setSoundAudio] = useState('./media/meow.mp3');
    
    const [sending, setSending] = useState(false);
    const [inShare, setInShare] = useState(false);
    const [sessionCode, setSessionCode] = useState('');
    const encodedMessage = encodeURIComponent('Hi! Join my Pomodoro session with the code: '+ {sessionCode});


    const socket = io('http://localhost:8000');

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
    }, [numberCycles, timeStudio, timeBreak, timeTotal]);

    const backPage = () => {
        //saveData(dataPomodoro);
        window.location.href = '/pomodoro';
    }

    useEffect(() => { 
        if (!inShare) {
            if (playTomato && dataPomodoro.cyclesLeft > 0) {
                const timer = setTimeout(() => {
                    passingTime(dataPomodoro, setDataPomodoro, setPlayTomato);
                }, 1000);
        
                return () => clearTimeout(timer);
            }
        }
    }, [dataPomodoro, playTomato, inShare]);

    useEffect(() => {
        setStringPrintTime(stringTime(dataPomodoro.timeLeft));
    }, [dataPomodoro.timeLeft]);


    const handleFunctionPomodoro = (value) => {
        if (inShare) {
            switch (value) {
                case 1:
                    if (playTomato) {
                        socket.emit('stop', sessionCode);
                    } else {
                        socket.emit('start', sessionCode)
                    }
                    break;
                case 2:
                    socket.emit('reset', sessionCode);
                    break;
                case 3:
                    socket.emit('skip', sessionCode);
                    break;
                case 4:
                    socket.emit('add', sessionCode);
                    break;
                case 5:
                    socket.emit('exit', sessionCode);
                    setInShare(false);
                    setSessionCode('');
                    backPage();
                    break;
                case 6:
                    editDataPomodoro (editData.cycles, editData.studioTime*60, editData.breakTime*60, dataPomodoro, setDataPomodoro, setIsEditing, setPlayTomato);
                    socket.emit('edit', dataPomodoro, playTomato, sessionCode);
                    break;
                default:
                    break;
            }
        } else {
            switch (value) {
                case 1:
                    pomodoroPlay (setPlayTomato, playTomato, dataPomodoro, setDataPomodoro);
                    break;
                case 2:
                    resetTime (dataPomodoro, setDataPomodoro, setPlayTomato);
                    break;
                case 3:
                    skipTime (dataPomodoro, setDataPomodoro, setPlayTomato);
                    break;
                case 4:
                    addCycle (dataPomodoro, setDataPomodoro);
                    break;
                case 5:
                    backPage();
                    break;
                case 6:
                    editDataPomodoro (editData.cycles, editData.studioTime*60, editData.breakTime*60, dataPomodoro, setDataPomodoro, setIsEditing, setPlayTomato);
                    break;
                default:
                    break;
            }
        }
    }   





    

    const settingShare = (value) => {
        setInShare(true);

        if (value) {
            console.log('Join session');
            socket.emit('join session', sessionCode);
        } else {
            console.log('Create session');
            socket.emit('create session', dataPomodoro, playTomato);
        }
    }

    const exitShare = () => {

        console.log('Exit session');

        socket.emit('exit', sessionCode);
        setInShare(false);
        setSessionCode('');
        setPlayTomato(false);
    }

    useEffect(() => {

        socket.on('session joined', (data) => {
            if (data.success) {
                console.log('Joined session');
            } else {
                console.log('Session not found');
                setInShare(false);
                socket.disconnect();
                setSessionCode('');
                alert('Session not found');
            }
        });

        socket.on('session code', (code) => {
            setSessionCode(code);
            console.log('Session code:', code);
        });

        socket.on('timerState', (data) => {
            timerState(data, setDataPomodoro);
            setPlayTomato(data.play);
            console.log('Timer state:', data);
        });

        socket.on('session closed', () => {
            console.log('Session closed');
            socket.disconnect();
        });


    }, [socket]);
    

    return (
        <div className="pomodoro-timer">

            {sending && (
                <div className="send-popup">
                    <button className='btnClose' onClick={() => setSending(false)}>
                        <img src={iconCross} alt="Close" className='iconCross'/>
                    </button>
                    {!inShare ? (
                        <>
                            <h2>Share your Pomodoro</h2>
                            <p>Create a new Pomodoro room for you and your friends</p>
                            
                            <button className='btn' onClick={() => settingShare(false)}>Start session</button>
                            <hr/>
                            <p>Get in a Pomodoro room</p>
                            <form onSubmit={(e) => {e.preventDefault(); settingShare(true);}}>
                                <label>Code:
                                    <input type="text" value={sessionCode} onChange={(e) => setSessionCode(e.target.value)} required/>
                                </label>
                                <br/>
                                <button className="btn" type="submit">Join</button>
                            </form>
                        </>
                    ) : (
                        <div style={{maxHeight: "700px"}}>
                            <h2>Welcome in the room </h2>
                            <p>Send the code to your friend to join your Pomodoro session</p>
                            <CopyableId id={sessionCode}/>
                            <div className="divBtn">
                                <a href={`https://wa.me/?text=${encodedMessage}`} target="_blank" rel="noopener noreferrer">
                                    <img src={iconWhatsApp} alt="WhatsApp" className='iconWhatsApp'/>
                                </a>
                                <a href={`https://t.me/share/url?url=${encodedMessage}`} target="_blank" rel="noopener noreferrer">
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
                        <button className="btn" type="submit" onClick={() => handleFunctionPomodoro(6)}>Save</button>
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
                    <PomodoroAnimation isStudioTime={dataPomodoro.isStudioTime} timeLeft={dataPomodoro.timeLeft} totalTime={dataPomodoro.isStudioTime ? (dataPomodoro.studioTime) : (dataPomodoro.breakTime)}/>
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
                    <button className='btnSettingTomato' onClick={() => handleFunctionPomodoro(2)}>
                        <img src={iconReset} alt="Reset" className='iconReset'/>
                    </button>

                    {dataPomodoro.done ? (
                        <button className='btnSettingTomato' onClick={() => handleFunctionPomodoro(5)}>
                            <img src={iconCrossDark} alt='exit' className='iconCross'/>
                        </button>
                    ) : (
                        <button className='btnSettingTomato' onClick={() => handleFunctionPomodoro(1)}>
                            {playTomato ? (<img src={iconStop} alt="stop" className='iconStop'/>) : (<img src={iconPlay} alt="Play" className='iconPlay'/>)}
                        </button>
                    )}

                    {dataPomodoro.done ? (
                        <button className='btnSettingTomato' onClick={() => handleFunctionPomodoro(4)}>
                            <img src={iconAdd} alt="Add" className='iconAdd'/>
                        </button>
                    ) : (
                        <button className='btnSettingTomato' onClick={() => handleFunctionPomodoro(3)}>
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