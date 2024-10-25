import React, {useState} from 'react';
import './css/Pomodoro.css';
import iconYoutube from './media/youtube.svg';
import iconSpotify from './media/spotify.svg';
import SpotifySearch from './Spotify';
import Youtube from './Youtube';
import iconArrow from './media/leftBackArrow.svg';



function PomodoroTimer({timeStudio, timeBreak, numberCycles, timeTotal}) {
    const [platformMusic, setPlatformMusic] = useState(0);


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
            </div>
            <div className="stats-container">
            </div>
        </div>
    );
}

export default PomodoroTimer;