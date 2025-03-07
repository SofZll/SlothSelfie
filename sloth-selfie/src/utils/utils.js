import { useMediaQuery } from "react-responsive";

const useIsDesktop = () => {
    const isMinWidth768 = useMediaQuery({ minWidth: 768 });
    const isPhoneLandscape = useMediaQuery({ maxWidth: 932, orientation: "landscape", maxHeight: 700 });

    return isMinWidth768 && !isPhoneLandscape;
};

export { useIsDesktop };