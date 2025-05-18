import io from 'socket.io-client';

const socket = io('https://site232453.tw.cs.unibo.it', {
    withCredentials: true,
    autoConnect: false,
});

export default socket;