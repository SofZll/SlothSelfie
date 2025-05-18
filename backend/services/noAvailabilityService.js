const NoAvailability = require('../models/noAvailabilityModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');

const checkAvailability = async (userId, eventStartDate, eventEndDate) => {
    const user = await User.findById(userId);
    if (!user) return false;

    const noAvailability = await NoAvailability.find({
        user: userId,
        $or: [
            { startDate: { $gt: eventStartDate, $lt: eventEndDate } },
            { endDate: { $gt: eventStartDate, $lt: eventEndDate } },
            { startDate: { $lt: eventStartDate }, endDate: { $gt: eventEndDate } }
        ]
    });

    if (noAvailability.length > 0) return false;

    if (user.isRoom || user.isDevice) {
        const freeDays = user.freeDays || [];
        const dayHours = user.dayHours || { start: '06:00', end: '21:59' };

        let current = new Date(eventStartDate);
        const end = new Date(eventEndDate);

        while (current <= end) {
            console.log('Current:', current);
            const weekday = current.toLocaleString('en-US', { weekday: 'long' });
            if (freeDays.includes(weekday)) return false;

            const [startHour, startMinute] = dayHours.start.split(':').map(Number);
            const [endHour, endMinute] = dayHours.end.split(':').map(Number);

            const availableStart = new Date(current);
            availableStart.setHours(startHour, startMinute, 0, 0);

            const availableEnd = new Date(current);
            availableEnd.setHours(endHour, endMinute, 59, 999);

            let rangeStart, rangeEnd;
            if (current.toDateString() === new Date(eventStartDate).toDateString()) {
                rangeStart = new Date(eventStartDate);
            } else {
                rangeStart = new Date(current);
                rangeStart.setHours(0, 0, 0, 0);
            }

            if (current.toDateString() === new Date(eventEndDate).toDateString()) {
                rangeEnd = new Date(eventEndDate);
            } else {
                rangeEnd = new Date(current);
                rangeEnd.setHours(23, 59, 59, 999);
            }
            
            if (rangeStart < availableStart || rangeEnd > availableEnd) {
                console.log('Not available: rangeStart < availableStart || rangeEnd > availableEnd');
                return false;
            }
            current.setDate(current.getDate() + 1);
            current.setHours(0, 0, 0, 0);
        }
        
    }

    return true;
}

module.exports = {
    checkAvailability,
}


