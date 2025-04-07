
const User = require('../models/userModel');
const Pomodoro = require('../models/pomodoroModel');

const getPomodori = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const pomodori = await Pomodoro.find({ user: user._id })
            .populate('user', 'username');

        res.status(200).json(pomodori);
    } catch (error) {
        console.error('Error fetching pomodori:', error);
        res.status(500).json({ message: error.message });
    }
}

const getPomodoriToDo = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const pomodori = await Pomodoro.find({ user: user._id, started: false })
            .populate('user', 'username');

        res.status(200).json(pomodori);
    } catch (error) {
        console.error('Error fetching pomodori:', error);
        res.status(500).json({ message: error.message });
    }
}



module.exports = {
    getPomodori,
    getPomodoriToDo
};