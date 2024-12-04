function calculateTime(dateTime) {
    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate)) {
        return 'Invalid date';
    }

    const currentTime = new Date();
    const diff = currentTime - parsedDate;
    const minutesDiff = Math.floor(diff / 60000);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    if (daysDiff > 0) {
        return `${daysDiff} days ago`;
    } else if (hoursDiff > 0) {
        return `${hoursDiff} hours ago`;
    } else {
        return `${minutesDiff} minutes ago`;
    }
};

export { calculateTime };