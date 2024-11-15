function calculateTime(time, date) {
    const currentTime = new Date();
    const [hours, minutes] = time.split(':');
    const tmp = new Date(date);
    tmp.setHours(hours);
    tmp.setMinutes(minutes);
    tmp.setSeconds(0);

    const diff = currentTime - tmp;
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