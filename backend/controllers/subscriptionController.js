const Subscription = require('../models/subscriptionModel');

const subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        const userId = req.session.userId;

        await Subscription.create({ user: userId, subscription });
        res.status(201).json({ message: 'Subscription saved successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
}

module.exports = { subscribe };