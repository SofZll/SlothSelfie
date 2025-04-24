const Subscription = require('../models/subscriptionModel');

const subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        const userId = req.session.userId;

        const existingSubscription = await Subscription.findOne({ user: userId });
        if (!existingSubscription) {
            const newSubscription = new Subscription({ user: userId, subscription });
            await newSubscription.save();
            return res.status(201).json({ success: true, message: 'Subscription saved successfully!' });
        } else {
            existingSubscription.subscription = subscription;
            await existingSubscription.save();
            return res.status(200).json({ success: true, message: 'Subscription updated successfully!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to save subscription' });
    }
}

module.exports = { subscribe };