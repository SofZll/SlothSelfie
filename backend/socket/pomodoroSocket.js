

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
                
            } else {
                pomodoro.timeLeft -= 1;
                if (pomodoro.isStudyTime) pomodoro.studiedTime += 1;
            }

            socket.to(sessionCode).emit('passing time', { pomodoro, play });
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
                const { settingsPomodoro, pomodoro, play, peopleInSession } = session;
                socket.emit('session joined', { settingsPomodoro, pomodoro, play, peopleInSession });

                socket.to(sessionCode).emit('number of people', { peopleInSession });
            } else {
                socket.emit('error', { message: 'Session not found' });
            }
        });

        socket.on('play', ({ play }) => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.play = play;
                socket.to(sessionCode).emit('play', { play });
            }

            //Start the timer
            if (play) {
                const interval = setInterval(() => {
                    passingTime();
                }, 1000);

                socket.on('disconnect', () => {
                    clearInterval(interval);
                });
            }
        });

        socket.on('stop', ({ play }) => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.play = play;
                socket.to(sessionCode).emit('stop', { play });
            }
        });

        socket.on('updated data session', ({ settingsPomodoro, pomodoro, play }) => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.settingsPomodoro = settingsPomodoro;
                session.pomodoro = pomodoro;
                session.play = play;
                socket.to(sessionCode).emit('updated data session', { settingsPomodoro, pomodoro, play });
            }
        });


        socket.on('disconnect', () => {
            const session = pomodoroSessionMap.get(sessionCode);
            if (session) {
                session.peopleInSession -= 1;
                socket.to(sessionCode).emit('number of people', { peopleInSession: session.peopleInSession });

                if (session.peopleInSession <= 0) {
                    pomodoroSessionMap.delete(sessionCode);
                }
            }
            socket.emit('session closed');
            socket.leave(sessionCode);
        }); 
    }
}

module.exports = pomodoroSocket;