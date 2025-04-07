import React from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';
import { useMusic } from '../../contexts/MusicContext';
import EditPomodoro from './EditPomodoro';
import PopUpShare from './PopUpShare';
import { Youtube, SearchCheck } from 'lucide-react';

const PopUpPomodoro = () => {

    const { popUp, resetPopUp } = usePomodoro();
    const { music, setMusic, resetMusic } = useMusic();


    return (

        <div className='d-flex justify-content-center align-items-center position-fixed pop-up'>
            <div className='modal-dialog custom-modal'>
                <div className='modal-content border border-secondary'>

                    <div className='modal-header'>
                        {popUp.edit && <h5 className='modal-title' style={{ color: '#244476' }}>Edit your Pomodoro</h5>}

                        {popUp.share && <h5 className='modal-title' style={{ color: '#244476' }}>Share your Pomodoro</h5>}

                        {popUp.calendar && <h5 className='modal-title' style={{ color: '#244476' }}>Plan your Pomodoro</h5>}

                        {popUp.music && <h5 className='modal-title' style={{ color: '#244476' }}>Study on Beat</h5>}

                        {popUp.stat && <h5 className='modal-title' style={{ color: '#244476' }}>yours Pomodoro Statistics</h5>}

                        <button type='button' className='close' onClick={() => resetPopUp()}>
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className='modal-body col-12'>
                        <div className='border-top border-secondary d-flex w-100 mt-3'></div>

                        {popUp.edit && (  
                            <EditPomodoro />
                        )}      
                        
                        {popUp.share && (
                            <PopUpShare />
                        )}

                        {popUp.calendar && (
                            <div className='d-flex justify-content-center'>
                                <h5>Calendar</h5>
                            </div>
                        )}

                        {popUp.music && (
                            <div className='d-flex justify-content-center'>
                                {music.youtube || music.spotify ? (
                                    <>
                                        {music.selected ? (
                                            <div className='d-flex flex-column fs-6 mt-3'>
                                                You are listening to
                                                <div className='fst-italic sloth-blue'>{music.title}</div>

                                                <button className='btn bg-sloth-blue btn-outline-light mx-5 my-3' onClick={() => resetMusic()}>
                                                    close
                                                </button>
                                            </div>
                                        ) : (
                                            <div className='d-flex flex-column fs-6 mt-3'>
                                                <div>Paste your {music.youtube ? 'Youtube' : 'Spotify'} link here</div>
                                                <div className='d-flex justify-content-center ps-4'>
                                                    <input type='text' className='form-control mt-2'
                                                    value={music.url}
                                                    onChange={(e) => setMusic({ ...music, url: e.target.value })} />
                                                    <button className='btn ms-0 ps-0' onClick={() => setMusic({ ...music, search: true })}>
                                                        <SearchCheck size='30' color='#244476' strokeWidth='1.5' className='ms-2' />
                                                    </button>
                                                </div>

                                                <div className='d-flex justify-content-end mt-3 align-items-center'>
                                                    ...or go to
                                                    <button className='btn m-0 p-1 fst-italic fw-medium sloth-blue' onClick={() => setMusic({ ...music, youtube: !music.youtube, spotify: !music.spotify })}>
                                                        {music.youtube ? ' Spotify' : ' Youtube'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className='d-flex flex-column fs-6 mt-3 w-100'>
                                        <div>Choose your music platform</div>
                                        <div className='d-flex justify-content-around w-100'>
                                            <button className='btn' onClick={() => setMusic({ ...music, youtube: true })}>
                                                <Youtube size='35' color='#244476' strokeWidth='1.5' />
                                            </button>
                                            <button className='btn' onClick={() => setMusic({ ...music, spotify: true })}>
                                                <svg xmlns='http://www.w3.org/2000/svg' width='27' height='27' fill='#244476' className='bi bi-spotify' viewBox='0 0 16 16'>
                                                    <path d='M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288'/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {popUp.stat && (
                            <div className='d-flex justify-content-center'>
                                <h5>Statistics</h5>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopUpPomodoro;