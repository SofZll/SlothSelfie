export function calculateTime(dateTime) {
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

// for sorting elements, currently used for posts and notifications
export function sortElements(elements, option) {
    const sortedElements = [...elements];
    if (option === 'mostRecent') {
        sortedElements.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (option === 'mostLiked') {
        sortedElements.sort((a, b) => b.likes.length - a.likes.length);
    }
    return sortedElements;
};