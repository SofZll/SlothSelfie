const NoAvailability = require('../models/noAvailabilityModel');
const User = require('../models/userModel');

//Fetch user's no availability time intervals
const getNoAvailability = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const noAvailability = await NoAvailability.find({ user: user._id })
        .populate('user', 'username')
        .sort({ startDate: 1 });

        if (!noAvailability) return res.status(404).json({ success: false, message: 'No availability not found' });

        res.status(200).json({ success: true, noAvailability });
    } catch (error) {
        console.error('Error fetching no availability:', error);
        res.status(500).json({ success: false, message: 'Error fetching no availability' });
    }
};

//Add new no availability for group events
const addNoAvailability = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const { startDate, endDate, days, repeatFrequency, numberOfOccurrences } = req.body;

    try {
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const listSameDate = await NoAvailability.find({ 
            $or: [
                { startDate: { $gte: startDate, $lte: endDate } },
                { endDate: { $gte: startDate, $lte: endDate } },
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ],
            user: user._id
        });

        if (listSameDate.length > 0) return res.status(400).json({ success: false, message: 'No availability already exists for this time interval' });

        if (repeatFrequency !== 'none') {

            const listNoAvailability = [];
            let gap = 1;
            let fatherId = null;

            if (repeatFrequency === 'weekly') gap = 7;
            else if (repeatFrequency === 'monthly') gap = 30;
            else if (repeatFrequency === 'yearly') gap = 365;

            for (let i = 0; i < numberOfOccurrences; i++) {

                const start = new Date(startDate) + (i * gap * 24 * 60 * 60 * 1000);
                const end = new Date(endDate) + (i * gap * 24 * 60 * 60 * 1000);

                const newNoAvailabilityInstance = new NoAvailability({
                    user: user._id,
                    startDate: start,
                    endDate: end,
                    days,
                    repeatFrequency,
                    fatherId: fatherId,
                });

                const response = await newNoAvailabilityInstance.save();
                listNoAvailability.push(response);
                if (i === 0) fatherId = response._id;
            }

            res.status(200).json({ success: true, listNoAvailability });
        } else {
            const newNoAvailability = new NoAvailability({
                user: user._id,
                startDate,
                endDate,
                days,
                repeatFrequency,
            });

            const noAvailability = await newNoAvailability.save();
            res.status(200).json({ success: true, noAvailability });
        }
    } catch (error) {
        console.error('Error adding no availability:', error);
        res.status(500).json({ success: false, message: 'Error adding no availability' });
    }
};

//Update no availability
/*
const updateNoAvailability = async (req, res) => {
    const { noAvailabilityId } = req.params;
    const { startDate, endDate, repeatFrequency, numberOfOccurrences } = req.body;

    try {
        const nA2update = await NoAvailability.findById(noAvailabilityId);

        if (!nA2update) return res.status(404).json({ success: false, message: 'No availability not found' });

        if (repeatFrequency !== 'none') {

            const listNoAvailability = await NoAvailability.find({ fatherId: nA2update.fatherId });

            const gap = 1;
*/

//Delete no availability
const deleteNoAvailability = async (req, res) => {
    const { noAvailabilityId } = req.params;

    try {
        const nA2delete = await NoAvailability.findById(noAvailabilityId);

        if (!nA2delete) return res.status(404).json({ success: false, message: 'No availability not found' });
    
        if (nA2delete.repeatFrequency !== 'none') {
            await NoAvailability.deleteMany({
                $or: [
                    { _id: nA2delete._id },
                    { fatherId: nA2delete.fatherId }
                ]
            });
        } else await NoAvailability.findByIdAndDelete(noAvailabilityId);
        
        res.status(200).json({ success: true, message: 'No availability deleted' });
    } catch (error) {
        console.error('Error deleting no availability:', error);
        res.status(500).json({ success: false, message: 'Error deleting no availability' });
    }
};

module.exports = {
    getNoAvailability,
    addNoAvailability,
    // updateNoAvailability,
    deleteNoAvailability
};

