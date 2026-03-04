let virtualNow = null;
let virtualStartTime = null;
let realStartTime = null;

const setTimeMachine = (date) => {
    virtualNow = new Date(date);
    virtualStartTime = virtualNow.getTime();
    realStartTime = Date.now();
    console.log('Virtual date set to:', virtualNow);
}

const resetTimeMachine = () => {
    virtualNow = null;
    virtualStartTime = null;
    realStartTime = null;
    console.log('Virtual date reset');
}

const getCurrentNow = () => {
    if (!virtualNow) return new Date();
    
    const now = Date.now();
    const elapsedRealTime = now - realStartTime;
    const newVirtualTime = virtualStartTime + elapsedRealTime;
    return new Date(newVirtualTime);
}

const isActive = () => {
    return virtualNow !== null;
}

module.exports = {
    setTimeMachine,
    resetTimeMachine,
    getCurrentNow,
    isActive
};