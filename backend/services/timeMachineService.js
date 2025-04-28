let virtualNow = null;

const setTimeMachine = (date) => {
    virtualNow = new Date(date);
    console.log('Virtual date set to:', virtualNow);
}

const resetTimeMachine = () => {
    virtualNow = null;
    console.log('Virtual date reset');
}

const getCurrentNow = () => {
    return virtualNow ? virtualNow : new Date();
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