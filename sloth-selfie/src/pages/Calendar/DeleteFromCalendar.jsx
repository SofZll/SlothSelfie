import React from 'react';

import DeletePopUpLayout from '../../layouts/DeletePopUpLayout';

import { useCalendar } from '../../contexts/CalendarContext';

const DeleteFromCalendar = () => {
    const { deletePopUp, setDeletePopUp } = useCalendar();

    const closeDeletePopUp = () => {
        setDeletePopUp({ toShow: {}, toCall: false, show: false, type: '' });
    }

    return (
        <>
            {deletePopUp.show && (
                <DeletePopUpLayout handleDelete={() => setDeletePopUp({ ...deletePopUp, toCall: true })} handleClose={() => closeDeletePopUp()}>
                    {deletePopUp.type === 'activity' && (
                        <>
                            <div className='d-flex flex-column text-start'>
                                Are you sure you want to delete this activity?
                            </div>
                            <div className='d-flex flex-column'>
                                <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{deletePopUp.toShow.title}</div>
                                <div className='d-flex w-100 justify-content-between'>
                                    {deletePopUp.toShow.deadline && (
                                        <div className='fst-italic' style={{ color: '#244476' }}>{new Date(deletePopUp.toShow.deadline).toLocaleDateString()}</div>
                                    )}
                                    <div className='fw-medium' style={{ color: '#244476' }}>{deletePopUp.toShow.completed ? 'Completed' : 'to complte'}</div>
                                </div>
                            </div>
                        </>
                    )}

                    {deletePopUp.type === 'event' && (
                        <>
                            <div className='d-flex flex-column text-start'>
                                Are you sure you want to delete this {deletePopUp.toShow.repeatFrequency !== 'none' ? 'recurring event' : 'event'}?
                            </div>
                            <div className='d-flex flex-column'>
                                <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{deletePopUp.toShow.title}</div>
                                <div className='fst-italic' style={{ color: '#244476' }}>start: {new Date(deletePopUp.toShow.startDate).toLocaleDateString()}</div>
                                <div className='fst-italic' style={{ color: '#244476' }}>end: {new Date(deletePopUp.toShow.endDate).toLocaleDateString()}</div>

                                {deletePopUp.toShow.repeatFrequency !== 'none' && (
                                    <>
                                    {deletePopUp.toShow.repeatMode === 'ntimes' ? (
                                        <div className='fst-italic' style={{ color: '#244476' }}>repeat {deletePopUp.toShow.repeatTimes} times</div>
                                    ) : (
                                        <div className='fst-italic' style={{ color: '#244476' }}>repeat until {new Date(deletePopUp.toShow.repeatEndDate).toLocaleDateString()}</div>
                                    )}
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {deletePopUp.type === 'no availability' && (
                        <>
                            <div className='d-flex flex-column text-start'>
                                Are you sure you want to delete this {deletePopUp.toShow.repeatFrequency !== 'none' && 'series of '}availability?
                            </div>
                            <div className='d-flex flex-column'>
                                <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{deletePopUp.toShow.title}</div>
                                <div className='fst-italic' style={{ color: '#244476' }}>
                                    {deletePopUp.toShow.startDate && (
                                        <div className='fst-italic' style={{ color: '#244476' }}>
                                            start: {new Date(deletePopUp.toShow.startDate).toLocaleDateString('en-CA')}
                                        </div>
                                    )}
                                    {deletePopUp.toShow.endDate && (
                                        <div className='fst-italic' style={{ color: '#244476' }}>
                                            end: {new Date(deletePopUp.toShow.endDate).toLocaleDateString('en-CA')}
                                        </div>
                                    )}
                                </div>
                                {deletePopUp.toShow.repeatFrequency !== 'none' && (
                                    <div className='fst-italic' style={{ color: '#244476' }}>
                                        repeat: {deletePopUp.toShow.repeatFrequency}
                                    </div>
                                )}
                                {deletePopUp.toShow.numberOfOccurrences && (
                                    <div className='fst-italic' style={{ color: '#244476' }}>
                                        occurrences: {deletePopUp.toShow.numberOfOccurrences}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {deletePopUp.type === 'task' && (
                        <>
                            <div className='d-flex flex-column text-start'>
                                Are you sure you want to delete this task?
                            </div>
                            <div className='d-flex flex-column'>
                                <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{deletePopUp.toShow.title}</div>
                                <div className='d-flex w-100 justify-content-between'>
                                    <div className='fst-italic' style={{ color: '#244476' }}>{new Date(deletePopUp.toShow.deadline).toLocaleDateString()}</div>
                                    <div className='fw-medium' style={{ color: '#244476' }}>{deletePopUp.toShow.completed ? 'Completed' : 'to complte'}</div>
                                </div>
                            </div>
                        </>
                    )}

                    {deletePopUp.type === 'pomodoro' && (
                        <>
                            <div className='d-flex flex-column text-start'>
                                Are you sure you want to delete this pomodoro?
                            </div>
                            <div className='fs-5 fw-bold text-center'>Planned {deletePopUp.toShow.title}</div>

                            <div className='d-flex flex-column mt-3'>
                                <div className='d-flex fst-italic'> Total Study Time: {deletePopUp.toShow.studyTime * deletePopUp.toShow.cycles/60} min</div>
                                <div className='d-flex fst-italic'> Deadline:</div>
                                <div className='d-flex fst-italic text-center pt-1'>{new Date(deletePopUp.toShow.deadline).toLocaleDateString('en-CA')}</div>
                            </div>
                        </>
                    )}


                    {deletePopUp.type === 'room' && (
                        <>
                            <div className='d-flex flex-column text-start'>
                                Are you sure you want to delete this room?
                            </div>
                            <div className='d-flex flex-column'>
                                <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{deletePopUp.toShow.username}</div>
                                <div className='fst-italic' style={{ color: '#244476' }}>
                                    {deletePopUp.toShow.events.lenth} hosted event{deletePopUp.toShow.events.lenth === 1 ? '' : 's'}
                                </div>
                            </div>
                        </>
                    )}

                    {deletePopUp.type === 'device' && (
                        <>
                            <div className='d-flex flex-column text-start'>
                                Are you sure you want to delete this device?
                            </div>
                            <div className='d-flex flex-column'>
                                <div className='fst-italic fw-bold' style={{ color: '#244476' }}>{deletePopUp.toShow.username}</div>
                                <div className='fst-italic' style={{ color: '#244476' }}>
                                    {deletePopUp.toShow.events.lenth} used in event{deletePopUp.toShow.events.lenth === 1 ? '' : 's'}
                                </div>
                            </div>
                        </>
                    )}
                </DeletePopUpLayout>
            )}
        </>
    )
}

export default DeleteFromCalendar;