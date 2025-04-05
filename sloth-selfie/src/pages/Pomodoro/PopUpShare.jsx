import React, { useEffect } from 'react';

import { usePomodoro } from '../../contexts/PomodoroContext';
import { Users, MessageSquare, CircleFadingPlus, DoorOpen, SearchCheck } from 'lucide-react';
import CopyButton from '../../components/CopyButton';

const PopUpShare = () => {
    const { socketData, setSocketData } = usePomodoro();

    return (
        <div className='d-flex flex-column w-100'>
            {socketData.inShare ? (
                <div className='d-flex flex-column w-100 position-relative'>
                    <div className='d-flex position-absolute top-0 end-0 p-2'>
                        <span className='me-1' style={{ color: '#244476' }}>{socketData.peopleInSession}</span>
                        <Users size='20' color='#244476' strokeWidth='1.5' />
                    </div>

                    <div className='d-flex w-100 mt-4 pb-3'>Room Code:</div>
                    <CopyButton Code={socketData.room} />

                    <div className='d-flex w-100 mt-4'>Share it with:</div>
                    <div className='d-flex w-100 justify-content-around py-3 mb-1'>
                        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='#244476' className='bi bi-whatsapp' viewBox='0 0 16 16'>
                            <path d='M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232'/>
                        </svg>

                        <MessageSquare size='20' color='#244476' strokeWidth='2' />

                        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='#244476' className='bi bi-telegram' viewBox='0 0 16 16'>
                            <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09'/>
                        </svg>
                    </div>

                    <div className='border-top border-secondary d-flex w-100 mt-3'></div>
                    <div className='d-flex w-100 mt-3 justify-content-center'>
                        <button className='btn btn-outline-light' style={{ backgroundColor: '#244476' }} onClick={() => setSocketData({ ...socketData, inShare: false })}>
                            Leave Room
                        </button>
                    </div>
                </div>
            ) : (
                <div className='d-flex flex-column w-100'>
                    <div className='d-flex w-100 mt-4'>Create a New Room</div>
                    <button className='btn' onClick={() => setSocketData({ ...socketData, inShare: true })}>
                        <CircleFadingPlus size='30' color='#244476' strokeWidth='2' />
                    </button>

                    <div className='border-top border-secondary d-flex w-100 mt-3'></div>

                    <div className='d-flex w-100 mt-4'>Join an Existing Room</div>
                    <div className='d-flex w-100 justify-content-center py-2 mb-2 align-items-center'>
                        <input type='text' id='room' className='form-control ms-4'
                            placeholder='Room Code'
                            value={socketData.room}
                            onChange={(e) => setSocketData({ ...socketData, room: e.target.value })} />

                        <button className='btn ms-0 ps-1' onClick={() => setSocketData({ ...socketData, inShare: true })}>
                            <SearchCheck size='30' color='#244476' strokeWidth='2' />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
};

export default PopUpShare;