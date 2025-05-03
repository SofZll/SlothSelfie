import { useMediaQuery } from 'react-responsive';

const useIsDesktop = () => {
    const isMinWidth768 = useMediaQuery({ minWidth: 768 });
    const isPhoneLandscape = useMediaQuery({ maxWidth: 932, orientation: 'landscape', maxHeight: 700 });

    return isMinWidth768 && !isPhoneLandscape;
};

const useIsMobileLandscape = () => {
    const isMobileWidth = useMediaQuery({ maxWidth: 700 });
    const isLandscapeHeight = useMediaQuery({ maxHeight: 700, orientation: 'landscape' });
    const isLandscapeWidth = useMediaQuery({ maxWidth: 1000, orientation: 'landscape' });

    return isMobileWidth || (isLandscapeHeight && isLandscapeWidth);
}

const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minutes of [0, 15, 30, 45]) {
            const formattedHour = hour < 10 ? `0${hour}` : hour;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            options.push({ value: `${formattedHour}:${formattedMinutes}`, label: `${formattedHour}:${formattedMinutes}` });
        }
    }
    return options;
};

const formatTime = (time) => {
    console.log('time', time);
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

const dateFromDate = (date) => {
    if (!date || !(date instanceof Date)) return '';
    try {
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const timeFromDate = (date) => {
    if (!date || !(date instanceof Date)) return '00:00';
    try {
        return date.toTimeString().substr(0, 5);
    } catch (e) {
        return '00:00';
    }
};

// Function to convert buffer to base64 string
// Since the image is stored a Buffer we need to convert it to base64
const bufferToBase64 = (buffer) => {
    const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
    return btoa(binary);
};

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const b64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(b64);
    const outputArr = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArr[i] = rawData.charCodeAt(i);
    return outputArr;
}

//todo: tm
const calculateTime = (d) => {
    if (!d) return '';
    const now = new Date();
    const date = new Date(d);
    const diff = Math.abs(now - date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return `${seconds} seconds ago`;
};

export { useIsDesktop, useIsMobileLandscape, generateTimeOptions, bufferToBase64, formatTime, dateFromDate, timeFromDate, urlBase64ToUint8Array, calculateTime };