const NoAvailability = require('../models/noAvailabilityModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');

const checkAvailability = async (userId, eventStartDate, eventEndDate) => {
    const noAvailability = await NoAvailability.find({
        user: userId,
        $or: [
            { startDate: { $gte: eventStartDate, $lte: eventEndDate } },
            { endDate: { $gte: eventStartDate, $lte: eventEndDate } },
            { startDate: { $lte: eventStartDate }, endDate: { $gte: eventEndDate } }
        ]
    });

    console.log('No Availability:', noAvailability);
    console.log('Event startdate:', eventStartDate);
    console.log('Event enddate:', eventEndDate);

    if (noAvailability.length > 0) return false;

    return true;
}

module.exports = {
    checkAvailability,
}


