const notificationSound = () => {
    const audio = new Audio('../assets/audios/notif.mp3');
    audio.volume = 0.6;
    audio.play().catch((e) => console.warn('Audio playback blocked:', e));
};

const messageSound = () => {
    const audio = new Audio('../assets/audios/message.mp3');
    audio.volume = 0.6;
    audio.play().catch((e) => console.warn('Audio playback blocked:', e));
};

export { notificationSound, messageSound };