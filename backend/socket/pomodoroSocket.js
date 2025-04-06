

const pomodoroSocket = {
    registerHandlers: (socket, io, pomodoroSessionMap) => {
        let sessionCode = '';

        const generateSessionCode = async () => {
            const { nanoid } = await import('nanoid');
            return nanoid(10);
        }

        const passingTime = () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (!session) return;

            const { settingsPomodoro, pomodoro } = session;
            console.log('Passing time:', pomodoro.timeLeft, pomodoro.isStudyTime);
            if (pomodoro.timeLeft <= 0) {
                if (pomodoro.isStudyTime) {
                    pomodoro.timeLeft = settingsPomodoro.breakTime;
                    pomodoro.cyclesLeft -= 1;
                    pomodoro.isStudyTime = false;
                    if (pomodoro.cyclesLeft === 0) {
                        pomodoro.finished = true;
                    }
                    session.play = false;
                } else {
                    pomodoro.timeLeft = settingsPomodoro.studyTime;
                    pomodoro.isStudyTime = true;
                }
                socket.to(sessionCode).emit('end circle', { pomodoro, play: false });
                socket.emit('end circle', { pomodoro, play: false });
            } else {
                if (!pomodoro.started) pomodoro.started = true;
                pomodoro.timeLeft -= 1;
                if (pomodoro.isStudyTime) pomodoro.studiedTime += 1;
                socket.to(sessionCode).emit('passing time', { pomodoro });
                socket.emit('passing time', { pomodoro });
            }

        }

        socket.on('create session', async ({ settingsPomodoro, pomodoro, play }) => {
            const code = await generateSessionCode();
            sessionCode = code;
            socket.join(sessionCode);
            const peopleInSession = 1;

            pomodoroSessionMap.set(sessionCode, {
                settingsPomodoro,
                pomodoro,
                play,
                peopleInSession,
            });
            socket.emit('session created', { sessionCode });
        });

        socket.on('join session', ({ room }) => {
            socket.join(room);

            sessionCode = room;
            const session = pomodoroSessionMap.get(sessionCode);

            if (session) {
                session.peopleInSession += 1;
                socket.emit('session joined', { settingsPomodoro: session.settingsPomodoro, pomodoro: session.pomodoro, play: session.play, peopleInSession: session.peopleInSession });
                socket.to(sessionCode).emit('number of people', { peopleInSession: session.peopleInSession });
            } else {
                socket.emit('error', { message: 'Session not found' });
            }
        });

        socket.on('play', ({ play }) => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (!session) return socket.emit('error', { message: 'Session not found' });

            session.play = play;
            socket.emit('play', { play });
            socket.to(sessionCode).emit('play', { play });

            //Start the timer
            if (play) {
                const interval = setInterval(() => {
                    if (!session.play) {
                        clearInterval(interval);
                        return;
                    }
                    passingTime();
                }, 1000);

                socket.on('disconnect', () => {
                    clearInterval(interval);
                });
            }
        });

        socket.on('reset pomodoro', () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.play = false;
                session.settingsPomodoro = { ...session.settingsPomodoro, additionalCycles: 0 };
                session.pomodoro = { ...session.pomodoro, timeLeft: session.settingsPomodoro.studyTime, cyclesLeft: session.settingsPomodoro.cycles, isStudyTime: true, finished: false };

                socket.emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
                socket.to(sessionCode).emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
            }
        });

        socket.on('skip back', () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                const { settingsPomodoro, pomodoro } = session;
                session.play = false;
                if (pomodoro.isStudyTime) {
                    if (pomodoro.timeLeft < settingsPomodoro.studyTime) pomodoro.timeLeft = settingsPomodoro.studyTime;
                    else if (pomodoro.cyclesLeft === settingsPomodoro.cycles) pomodoro.timeLeft = settingsPomodoro.studyTime;
                    else {
                        pomodoro.timeLeft = settingsPomodoro.breakTime;
                        pomodoro.cyclesLeft += 1;
                        pomodoro.isStudyTime = false;
                    }
                } else {
                    if (pomodoro.timeLeft < settingsPomodoro.breakTime) pomodoro.timeLeft = settingsPomodoro.breakTime;
                    else {
                        pomodoro.timeLeft = settingsPomodoro.studyTime;
                        pomodoro.isStudyTime = true;
                    }
                }

                socket.emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
                socket.to(sessionCode).emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
            }
        });

        socket.on('new pomodoro', () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.play = false;
                session.settingsPomodoro = { studyTime: 60*30, breakTime: 60*5, cycles: 5, additionalCycles: 0};
                session.pomodoro = {
                    _id: '',
                    user: '',
                    sharedWith: [],
                    timeLeft: session.settingsPomodoro.studyTime,
                    cyclesLeft: session.settingsPomodoro.cycles,
                    isStudyTime: true,
                    started: false,
                    finished: false,
                    studiedTime: 0,
                };
                socket.emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
                socket.to(sessionCode).emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
            }
        });

        socket.on('add cycle', () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.play = false;
                session.settingsPomodoro = { ...session.settingsPomodoro, additionalCycles: session.settingsPomodoro.additionalCycles + 1 };
                session.pomodoro = { ...session.pomodoro, cyclesLeft: session.pomodoro.cyclesLeft + 1, finished: false };
                socket.emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
                socket.to(sessionCode).emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
            }
        });

        socket.on('skip time', () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                const { settingsPomodoro, pomodoro } = session;
                session.play = false;
                if (pomodoro.isStudyTime) {
                    pomodoro.timeLeft = settingsPomodoro.breakTime;
                    pomodoro.cyclesLeft -= 1;
                    pomodoro.isStudyTime = false;
                    if (pomodoro.cyclesLeft === 0) {
                        pomodoro.finished = true;
                    }
                } else {
                    pomodoro.timeLeft = settingsPomodoro.studyTime;
                    pomodoro.isStudyTime = true;
                }
                socket.emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
                socket.to(sessionCode).emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
            }
        });

        socket.on('edit pomodoro', ({ study, breakTime, cicles }) => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.play = false;
                if (session.settingsPomodoro.cycles - session.pomodoro.cyclesLeft > cicles) {
                    session.pomodoro.timeLeft = study;
                    session.pomodoro.cyclesLeft = cicles;
                    session.pomodoro.isStudyTime = true;
                    session.pomodoro.finished = true;
                } else {
                    session.pomodoro.cyclesLeft = cicles - (session.settingsPomodoro.cycles - session.pomodoro.cyclesLeft);

                    if (session.pomodoro.isStudyTime) {
                        if (session.settingsPomodoro.studyTime - session.pomodoro.timeLeft > study) {
                            session.pomodoro.timeLeft = breakTime;
                            session.pomodoro.cyclesLeft -= 1;
                            session.pomodoro.isStudyTime = false;
                            if(session.pomodoro.cyclesLeft === 0) session.pomodoro.finished = true;
                        }
                        else session.pomodoro.timeLeft = study - (session.settingsPomodoro.studyTime - session.pomodoro.timeLeft);
                    } else {
                        if (session.settingsPomodoro.breakTime - session.pomodoro.timeLeft > breakTime) {
                            session.pomodoro.timeLeft = study;
                            session.pomodoro.isStudyTime = true;
                        } else session.pomodoro.timeLeft = breakTime - (session.settingsPomodoro.breakTime - session.pomodoro.timeLeft);
                    }

                }
                session.settingsPomodoro = { studyTime: study, breakTime, cycles: cicles, additionalCycles: 0 };
                socket.emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
                socket.to(sessionCode).emit('updated data session', { pomodoro: session.pomodoro, settingsPomodoro: session.settingsPomodoro });
            }
        });

        socket.on('exit session', () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.peopleInSession -= 1;
                socket.to(sessionCode).emit('number of people', { peopleInSession: session.peopleInSession });

                if (session.peopleInSession <= 0) pomodoroSessionMap.delete(sessionCode);
            }
            socket.emit('session closed');
            socket.leave(sessionCode);
        }); 
    }
}

module.exports = pomodoroSocket;