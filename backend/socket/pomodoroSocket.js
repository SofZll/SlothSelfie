const { v4: uuidv4 } = require('uuid');

const pomodoroSocket = {
    registerHandlers: (socket, io, settingPomodoro, userSocketMap, intervals) => {
        let sessionCode = '';
        
        socket.on('create session', (dataPomodoro, studying) => {
            sessionCode = uuidv4().slice(0, 6);
    
            settingPomodoro[sessionCode] = {
                timer: dataPomodoro.timeLeft,
                cycles: dataPomodoro.cycles,
                cyclesLeft: dataPomodoro.cyclesLeft,
                breakTime: dataPomodoro.breakTime,
                studyTime: dataPomodoro.studioTime,
                people: 1,
                isStudioTime: dataPomodoro.isStudioTime,
                notStartedYet: dataPomodoro.notStartedYet,
                done: dataPomodoro.done,
                addedCycles: dataPomodoro.addedCycles,
                studioTimeTotal: dataPomodoro.studioTimeTotal,
                play: studying,
            }
    
            socket.join(sessionCode);
            console.log('Create session');
            socket.emit('session code', sessionCode);
            socket.emit('timerState', settingPomodoro[sessionCode]);
    
        });
    
        socket.on('join session', (sessionCode) => {
            console.log('Join session');
            if (settingPomodoro[sessionCode]) {
                socket.join(sessionCode);
                socket.emit('session joined', {success: true, sessionCode});
                settingPomodoro[sessionCode].people++;
                io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
            } else {
                socket.emit('session joined', {success: false});
            }
        });
    
        socket.on('stop', (sessionCode) => {
            clearInterval(intervals[sessionCode]);
            delete intervals[sessionCode];
            settingPomodoro[sessionCode].play = false;
            console.log('Stop timer');
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
        });
    
        const passingTime = (sessionCode) => {
            if (intervals[sessionCode]) {
                if (settingPomodoro[sessionCode].timer > 0) {
                    settingPomodoro[sessionCode].timer--;
                    settingPomodoro[sessionCode].studioTimeTotal++;
                } else {
                    if (settingPomodoro[sessionCode].isStudioTime) {
                        if (settingPomodoro[sessionCode].cyclesLeft > 1) {
                            settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].breakTime;
                            settingPomodoro[sessionCode].isStudioTime = false;
                        } else {
                            settingPomodoro[sessionCode].timer = 0;
                            settingPomodoro[sessionCode].done = true;
                        }
                    } else {
                        settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
                        settingPomodoro[sessionCode].isStudioTime = true;
                        settingPomodoro[sessionCode].cyclesLeft--;
                    }
                }
            }
        }
        
        socket.on('start', (sessionCode) => {
            if(settingPomodoro[sessionCode].notStartedYet) {
                settingPomodoro[sessionCode].notStartedYet = false;
            }
            
    
            if (!intervals[sessionCode]) {
                settingPomodoro[sessionCode].play = true;
                intervals[sessionCode] = setInterval(() => {
                    passingTime(sessionCode);
                    io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
                    if (settingPomodoro[sessionCode].done) {
                        clearInterval(intervals[sessionCode]);
                        delete intervals[sessionCode];
                        console.log('Stop timer');
                        io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
                    }
                }, 1000);
            }
        });
    
        socket.on('reset', (sessionCode) => {
            settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
            settingPomodoro[sessionCode].cycles = settingPomodoro[sessionCode].cycles - settingPomodoro[sessionCode].addedCycles;
            settingPomodoro[sessionCode].cyclesLeft = settingPomodoro[sessionCode].cycles;
            settingPomodoro[sessionCode].isStudioTime = true;
            settingPomodoro[sessionCode].notStartedYet = true;
            settingPomodoro[sessionCode].done = false;
            settingPomodoro[sessionCode].addedCycles = 0;
            settingPomodoro[sessionCode].studioTimeTotal = 0;
            clearInterval(intervals[sessionCode]);
            delete intervals[sessionCode];
            console.log('Reset timer');
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
        });
    
        socket.on('skip', (sessionCode) => {
            if (settingPomodoro[sessionCode].isStudioTime) {
                settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].breakTime;
                settingPomodoro[sessionCode].isStudioTime = false;
                settingPomodoro[sessionCode].cyclesLeft--;
            } else {
                settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
                settingPomodoro[sessionCode].isStudioTime = true;
            }
    
            console.log('Skip timer');
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
        });
    
        socket.on('add', (sessionCode) => {
            settingPomodoro[sessionCode].cycles++;
            settingPomodoro[sessionCode].cyclesLeft++;
            settingPomodoro[settingPomodoro].addedCycles++;
            console.log('Add cycle');
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
        });
    
        socket.on('exit', (sessionCode) => {
            settingPomodoro[sessionCode].people--;
            console.log('Leave session');
            if (settingPomodoro[sessionCode].people === 0) {
                clearInterval(intervals[sessionCode]);
                delete intervals[sessionCode];
                delete settingPomodoro[sessionCode];
                console.log('Delete session');
                socket.emit('session closed');
            } else {
                io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
                socket.leave(sessionCode);
            }
        });
    
        socket.on('disconnect', () => {
            console.log('Client disconnected', sessionCode);
    
        });
    
        socket.on('edit', (sessionCode, studying, dataPomodoro) => {
            settingPomodoro[sessionCode] = {
                timer: dataPomodoro.studioTime,
                cycles: dataPomodoro.cycles,
                cyclesLeft: dataPomodoro.cyclesLeft,
                breakTime: dataPomodoro.breakTime,
                studyTime: dataPomodoro.studioTime,
                isStudioTime: dataPomodoro.isStudioTime,
                notStartedYet: dataPomodoro.notStartedYet,
                done: dataPomodoro.done,
                addedCycles: dataPomodoro.addedCycles,
                studioTimeTotal: dataPomodoro.studioTimeTotal,
                play: studying,
            }
            console.log('Edit session');
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
        });
    }
}

module.exports = pomodoroSocket;