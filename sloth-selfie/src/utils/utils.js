import { useMediaQuery } from "react-responsive";

const useIsDesktop = () => {
    const isMinWidth768 = useMediaQuery({ minWidth: 768 });
    const isPhoneLandscape = useMediaQuery({ maxWidth: 932, orientation: "landscape", maxHeight: 700 });

    return isMinWidth768 && !isPhoneLandscape;
};

const useIsMobileLandscape = () => {
    const isMobileWidth = useMediaQuery({ maxWidth: 700 });
    const isLandscapeHeight = useMediaQuery({ maxHeight: 700, orientation: "landscape" });
    const isLandscapeWidth = useMediaQuery({ maxWidth: 1000, orientation: "landscape" });

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

// function for date chatbox and forum

// Function to convert buffer to base64 string
// Since the image is stored a Buffer we need to convert it to base64
const bufferToBase64 = (buffer) => {
    const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
    return btoa(binary);
};

export { useIsDesktop, useIsMobileLandscape, generateTimeOptions, bufferToBase64 };