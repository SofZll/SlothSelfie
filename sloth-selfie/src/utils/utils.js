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

export { useIsDesktop, useIsMobileLandscape };