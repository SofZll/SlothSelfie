import { useMediaQuery } from "react-responsive";

const useIsDesktop = () => {
    return useMediaQuery({ minWidth: 768 });
};

export { useIsDesktop };