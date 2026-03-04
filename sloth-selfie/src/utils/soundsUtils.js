const notificationSound = () => {
    const audio = new Audio('/audios/notif.mp3');
    audio.volume = 0.6;
    audio.play().catch((e) => console.warn('Audio playback blocked:', e));
};

const messageSound = () => {
    const audio = new Audio('/audios/message.mp3');
    audio.volume = 0.6;
    audio.play().catch((e) => console.warn('Audio playback blocked:', e));
};

export { notificationSound, messageSound };