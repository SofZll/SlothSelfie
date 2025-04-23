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

const addSingleNoAvailability = async (user, startDate, endDate, days, repeatFrequency, numberOfOccurrences, fatherId) => {

    try {
        if (!user) return ({ success: false, message: 'User not found' });

        const listSameDate = await NoAvailability.find({ 
            $or: [
                { startDate: { $gte: startDate, $lte: endDate } },
                { endDate: { $gte: startDate, $lte: endDate } },
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ],
            user: user._id
        });

        if (listSameDate.length > 0) return ({ success: false, message: 'No availability already exists for this time interval' });

        const newNoAvailabilityInstance = new NoAvailability({
            user: user._id,
            startDate,
            endDate,
            days,
            repeatFrequency
        });

        if (fatherId) newNoAvailabilityInstance.fatherId = fatherId;
        if (repeatFrequency !== 'none' && numberOfOccurrences) newNoAvailabilityInstance.numberOfOccurrences = numberOfOccurrences;

        const response = await newNoAvailabilityInstance.save();
        return ({ success: true, response });
    } catch (error) {
        console.error('Error adding no availability:', error);
        return ({ success: false, message: 'Error adding no availability' });
    }
};
        


//Add new no availability for group events
const addNoAvailability = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const { startDate, endDate, days, repeatFrequency, numberOfOccurrences } = req.body;

    try {
        
        if (repeatFrequency === 'none') {
            const response = await addSingleNoAvailability(user, startDate, endDate, days, repeatFrequency);
            if (!response.success) res.status(400).json({ success: false, message: response.message });
            else res.status(200).json({ success: true, noAvailability: response.response });

        } else {

            const listNoAvailability = [];
            let gap = 1;
            let fatherId = null;

            if (repeatFrequency === 'weekly') gap = 7;
            else if (repeatFrequency === 'monthly') gap = 30;
            else if (repeatFrequency === 'yearly') gap = 365;

            for (let i = 0; i < numberOfOccurrences; i++) {

                const start = new Date(startDate);
                start.setDate(start.getDate() + (i * gap));
                const end = new Date(endDate);
                end.setDate(end.getDate() + (i * gap));
                console.log('start', start);
                console.log('end', end);

                const response = await addSingleNoAvailability(user, start, end, days, repeatFrequency, numberOfOccurrences, fatherId);

                if (!response.success) {
                    res.status(400).json({ success: false, message: response.message });
                    if (i !== 0) await NoAvailability.deleteMany({ 
                        $or: [
                            { _id: fatherId },
                            { fatherId: fatherId }
                        ]
                    });
                    return;
                }

                console.log('response', response);

                if (i === 0) fatherId = response.response._id;
                listNoAvailability.push(response.response);
            }

            res.status(200).json({ success: true, listNoAvailability });
        }
    } catch (error) {
        console.error('Error adding no availability:', error);
        res.status(500).json({ success: false, message: 'Error adding no availability' });
    }
};

//const editNoAvailability = async (id, startDate, endDate, days, repeatFrequency, numberOfOccurrences) => {


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
                    { fatherId: nA2delete.fatherId },
                    { _id: nA2delete.fatherId },
                    { fatherId: nA2delete._id }
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

