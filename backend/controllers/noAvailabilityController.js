const NoAvailability = require('../models/noAvailabilityModel');
const User = require('../models/userModel');

const { getCurrentNow } = require('../services/timeMachineService');

//Fetch user's no availability time intervals
const getNoAvailability = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const noAvailability = await NoAvailability.find({ user: user._id, createdAt: { $lte: getCurrentNow() } })
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
            repeatFrequency,
            createdAt: getCurrentNow(),
            updatedAt: getCurrentNow()
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
    const { startDate, endDate, days, repeatFrequency, numberOfOccurrences, tools } = req.body;

    try {

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const users = [];

        if (user.isAdmin) {
            for (let i = 0; i < tools.length; i++) {
                const tool = await User.findById(tools[i]);
                console.log('tool', tool);
                if (!tool) return res.status(404).json({ success: false, message: 'Tool not found' });
                users.push(tool);
            }
        } else {
            users.push(user);
        }
        
        const listNoAvailability = [];

        for (let j = 0; j < users.length; j++) {
        
            if (repeatFrequency === 'none') {
                const response = await addSingleNoAvailability(users[j], startDate, endDate, days, repeatFrequency);
                if (!response.success) return res.status(400).json({ success: false, message: response.message });
                else listNoAvailability.push(response.response);

            } else {

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

                    const response = await addSingleNoAvailability(users[j], start, end, days, repeatFrequency, numberOfOccurrences, fatherId);

                    if (!response.success) {
                        if (i !== 0) await NoAvailability.deleteMany({ 
                            $or: [
                                { fatherId: fatherId }
                            ]
                        });
                        return res.status(400).json({ success: false, message: response.message });
                    }

                    if (i === 0) {
                        fatherId = response.response._id;
                        await NoAvailability.findByIdAndUpdate(fatherId, { fatherId: fatherId });
                    }
                    listNoAvailability.push(response.response);
                }
            }
        }
        res.status(200).json({ success: true, listNoAvailability });
    } catch (error) {
        console.error('Error adding no availability:', error);
        res.status(500).json({ success: false, message: 'Error adding no availability' });
    }
};

const editNoAvailability = async (id, startDate, endDate, days, repeatFrequency, numberOfOccurrences) => {
    try {
        const nA2update = await NoAvailability.findById(id);
        
        if (!nA2update) {
            console.log('No availability not found');
            return ({ success: false, message: 'No availability not found' });
        }
        
        const listSameDate = await NoAvailability.find({ 
            $or: [
                { startDate: { $gte: startDate, $lte: endDate } },
                { endDate: { $gte: startDate, $lte: endDate } },
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ],
            user: nA2update.user,
            _id: { $ne: nA2update._id }
        });

        if (listSameDate.length > 0) return ({ success: false, message: 'No availability already exists for this time interval' });

        nA2update.startDate = startDate;
        nA2update.endDate = endDate;
        nA2update.days = days;
        nA2update.repeatFrequency = repeatFrequency;
        nA2update.updatedAt = getCurrentNow();
        
        if (repeatFrequency === 'none') {
            nA2update.fatherId = null;
            nA2update.numberOfOccurrences = 0;
        } else {
            nA2update.fatherId = nA2update.fatherId || id;
            nA2update.numberOfOccurrences = numberOfOccurrences;
        }

        const response = await nA2update.save();
        console.log('response', response);
        return ({ success: true, response });
    } catch (error) {
        console.error('Error updating no availability:', error);
        return ({ success: false, message: 'Error updating no availability' });
    }
}


//Update no availability
const updateNoAvailability = async (req, res) => {
    const { noAvailabilityId } = req.params;
    const { startDate, endDate, days, repeatFrequency, numberOfOccurrences } = req.body;

    try {
        const nA2update = await NoAvailability.findById(noAvailabilityId);
        if (!nA2update) return res.status(404).json({ success: false, message: 'No availability not found' });
        
        const updatedNoAvailability = [];

        if (repeatFrequency === 'none') {
            if( nA2update.repeatFrequency !== 'none') {
                const listNoAvailability = await NoAvailability.find({ fatherId: nA2update.fatherId });
                for (let i = 1; i < listNoAvailability.length; i++) {
                    await NoAvailability.findByIdAndDelete(listNoAvailability[i]._id);
                }

                const response = await editNoAvailability(listNoAvailability[0]._id, new Date(startDate), new Date(endDate), days, repeatFrequency);
                if (!response.success) return res.status(400).json({ success: false, message: response.message });
                else updatedNoAvailability.push(response.response);
            } else {
                const response = await editNoAvailability(noAvailabilityId, new Date(startDate), new Date(endDate), days, repeatFrequency);
                if (!response.success) res.status(400).json({ success: false, message: response.message });
                else updatedNoAvailability.push(response.response);
            }
        } else {

            const noAvailability = await NoAvailability.findById(noAvailabilityId);
            if (!noAvailability) return res.status(404).json({ success: false, message: 'No availability not found' });

            let gap = 1;

            if (repeatFrequency === 'weekly') gap = 7;
            else if (repeatFrequency === 'monthly') gap = 30;
            else if (repeatFrequency === 'yearly') gap = 365;

            let startDifference, endDifference, additionStartDate, additionEndDate;

            if (new Date(startDate).getTime() > new Date(noAvailability.startDate).getTime()) {
                startDifference = new Date(startDate).getTime() - new Date(noAvailability.startDate).getTime();
                additionStartDate = true;
            } else if (new Date(startDate).getTime() < new Date(noAvailability.startDate).getTime()) {
                startDifference = new Date(noAvailability.startDate).getTime() - new Date(startDate).getTime();
                additionStartDate = false;
            } else {
                startDifference = 0;
                additionStartDate = false;
            }

            if (new Date(endDate).getTime() > new Date(noAvailability.endDate).getTime()) {
                endDifference = new Date(endDate).getTime() - new Date(noAvailability.endDate).getTime();
                additionEndDate = true;
            } else if (new Date(endDate).getTime() < new Date(noAvailability.endDate).getTime()) {
                endDifference = new Date(noAvailability.endDate).getTime() - new Date(endDate).getTime();
                additionEndDate = false;
            } else {
                endDifference = 0;
                additionEndDate = false;
            }

            fatherId = noAvailability.fatherId || noAvailabilityId;
            const listNoAvailability = await NoAvailability.find({
                $or: [
                    { _id: noAvailabilityId },
                    { fatherId: fatherId }
                ]
            }).sort({ startDate: 1 });

            if (!listNoAvailability) return res.status(404).json({ success: false, message: 'No availability not found' });

            for (let i = 0; i < numberOfOccurrences; i++) {
                const start = new Date(new Date(listNoAvailability[0].startDate).getTime() + (i * gap * 1000 * 60 * 60 * 24) + (additionStartDate ? startDifference : - startDifference));
                const end = new Date(new Date(listNoAvailability[0].endDate).getTime() + (i * gap * 1000 * 60 * 60 * 24) + (additionEndDate ? endDifference : - endDifference));

                if (i >= listNoAvailability.length) {
                    const response = await addSingleNoAvailability(nA2update.user, start, end, days, repeatFrequency, numberOfOccurrences, fatherId);
                    if (!response.success) {
                        res.status(400).json({ success: false, message: response.message });
                        return;
                    }
                    updatedNoAvailability.push(response.response);
                } else {
                    const response = await editNoAvailability(listNoAvailability[i]._id, start, end, days, repeatFrequency, numberOfOccurrences);
                    if (!response.success) {
                        res.status(400).json({ success: false, message: response.message });
                        return;
                    }
                    updatedNoAvailability.push(response.response);
                }
            }

            if (numberOfOccurrences < listNoAvailability.length) {
                for (let i = numberOfOccurrences; i < listNoAvailability.length; i++) {
                    await NoAvailability.findByIdAndDelete(listNoAvailability[i]._id);
                }
            }
        }

        res.status(200).json({ success: true, listNoAvailability: updatedNoAvailability });
    } catch (error) {
        console.error('Error updating no availability:', error);
        res.status(500).json({ success: false, message: 'Error updating no availability' });
    }
};



//Delete no availability
const deleteNoAvailability = async (req, res) => {
    const { noAvailabilityId } = req.params;

    try {
        const nA2delete = await NoAvailability.findById(noAvailabilityId);

        if (!nA2delete) return res.status(404).json({ success: false, message: 'No availability not found' });
    
        if (nA2delete.repeatFrequency !== 'none') {
            await NoAvailability.deleteMany({ fatherId: nA2delete.fatherId });
        } else await NoAvailability.findByIdAndDelete(noAvailabilityId);
        
        res.status(200).json({ success: true, message: 'No availability deleted' });
    } catch (error) {
        console.error('Error deleting no availability:', error);
        res.status(500).json({ success: false, message: 'Error deleting no availability' });
    }
};

//Fetch no availability for tool
const getNoAvailabilitiesTool = async (toolId) => {
    try {
        const noAvailability = await NoAvailability.find({ user: toolId, createdAt: { $lte: getCurrentNow() } })
        .populate('user', 'username')
        .lean();

        if (!noAvailability) return ({ success: false, message: 'No availability not found' });
        return ({ success: true, noAvailability });
    } catch (error) {
        console.error('Error fetching no availability:', error);
        return ({ success: false, message: 'Error fetching no availability' });
    }
}

module.exports = {
    getNoAvailability,
    addNoAvailability,
    updateNoAvailability,
    deleteNoAvailability,
    getNoAvailabilitiesTool,
};

