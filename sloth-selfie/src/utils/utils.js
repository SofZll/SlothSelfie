import { useMediaQuery } from "react-responsive";

const useIsDesktop = () => {
    return useMediaQuery({ minWidth: 769 });
};

export { useIsDesktop };