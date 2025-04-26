let virtualDate = null;

const setTimeMachine = (date) => {
    virtualDate = new Date(date);
    console.log('Virtual date set to:', virtualDate);
}

const resetTimeMachine = () => {
    virtualDate = null;
    console.log('Virtual date reset');
}

const getCurrentDate = () => {
    return virtualDate ? virtualDate : new Date();
}

const isActive = () => {
    return virtualDate !== null;
}

module.exports = {
    setTimeMachine,
    resetTimeMachine,
    getCurrentDate,
    isActive
};