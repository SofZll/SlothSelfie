
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

const addPomodoro = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const { studyTime, breakTime, cycles, started, finished } = req.body;

    try {
        const newPomodoro = new Pomodoro({
            user: user._id,
            studyTime,
            breakTime,
            cycles,
            started,
            finished
        });

        if (started) {
            if (finished) newPomodoro.finishedDate = new Date();

            const { isStudyTime, studiedTime, cyclesLeft, additionalCycles } = req.body;
            newPomodoro.isStudyTime = isStudyTime;
            newPomodoro.studiedTime = studiedTime;
            newPomodoro.cyclesLeft = cyclesLeft;
            newPomodoro.additionalCycles = additionalCycles;
        }

        const pomodoro = await newPomodoro.save();
        res.status(201).json(pomodoro);
    } catch (error) {
        console.error('Error creating pomodoro:', error);
        res.status(500).json({ message: error.message });
    }
}

const editPomodoro = async (req, res) => {
    const { pomodoroId } = req.params;
    const { studyTime, breakTime, cycles, started, finished } = req.body;

    try {
        const pomodoro = await Pomodoro.findByIdAndUpdate(pomodoroId, {
            studyTime,
            breakTime,
            cycles,
            started,
            finished
        }, { new: true });

        if (!pomodoro) {
            return res.status(404).json({ message: 'Pomodoro not found' });
        }

        res.status(200).json(pomodoro);
    } catch (error) {
        console.error('Error updating pomodoro:', error);
        res.status(500).json({ message: error.message });
    }
}

const deletePomodoro = async (req, res) => {
    const { pomodoroId } = req.params;

    try {
        const pomodoro = await Pomodoro.findByIdAndDelete(pomodoroId);

        if (!pomodoro) {
            return res.status(404).json({ message: 'Pomodoro not found' });
        }

        res.status(200).json({ message: 'Pomodoro deleted successfully' });
    } catch (error) {
        console.error('Error deleting pomodoro:', error);
        res.status(500).json({ message: error.message });
    }
}

const updateCycles = async (req, res) => {
    const { pomodoroId } = req.params;
    const { cyclesLeft, isStudyTime, studiedTime, finished, started } = req.body;

    try {
        const pomodoro = await Pomodoro.findByIdAndUpdate(pomodoroId, {
            cyclesLeft,
            isStudyTime,
            studiedTime,
            finished,
            finishedDate: finished ? new Date() : null,
            started
        }, { new: true });

        if (!pomodoro) {
            return res.status(404).json({ message: 'Pomodoro not found' });
        }

        res.status(200).json(pomodoro);
    } catch (error) {
        console.error('Error updating cycles:', error);
        res.status(500).json({ message: error.message });
    }
}

const addAdditionalCycle = async (req, res) => {
    const { pomodoroId } = req.params;
    const { additionalCycles } = req.body;

    try {
        const pomodoro = await Pomodoro.findByIdAndUpdate(pomodoroId, {
            additionalCycles,
            finished: false,
            finishedDate: null
        }, { new: true });

        if (!pomodoro) {
            return res.status(404).json({ message: 'Pomodoro not found' });
        }

        res.status(200).json(pomodoro);
    } catch (error) {
        console.error('Error adding additional cycle:', error);
        res.status(500).json({ message: error.message });
    }
}

const getPomodoroById = async (req, res) => {
    const { pomodoroId } = req.params;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const pomodoro = await Pomodoro.findById(pomodoroId)
            .populate('user', 'username')

        if (!pomodoro) {
            return res.status(404).json({ message: 'Pomodoro not found' });
        }

        if (pomodoro.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        res.status(200).json(pomodoro);
    } catch (error) {
        console.error('Error fetching pomodoro:', error);
        res.status(500).json({ message: error.message });
    }
}

const totalStudiedTime = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const pomodori = await Pomodoro.find({ user: user._id, started: true });

        if (pomodori.length === 0) return res.status(200).json({ totalStudiedTime: 0 });
    
        const totalTime = pomodori.reduce((acc, pomodoro) => acc + pomodoro.studiedTime, 0);

        res.status(200).json({ totalStudiedTime: totalTime });

    } catch (error) {
        console.error('Error fetching pomodori:', error);
        res.status(500).json({ message: error.message });
    }
}

const timePomodoriMonths = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        const timePerMonth = await Pomodoro.aggregate([
            { $match: { user: user._id, finished: true } },
            {
                $group: {
                    _id: {
                        year: { $year: "$finishedDate" },
                        month: { $month: "$finishedDate" }
                    },
                    totalStudiedTime: { $sum: "$studiedTime" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        console.log(timePerMonth, 'timePerMonth');

        const months = [];
        for (let i = 0; i < 5; i++) {
            const month = (thisMonth - i + 12)  % 12;
            const foundMonth = timePerMonth.find(item => item.month === month && item.year === thisYear);
            months.push({
                month,
                totalStudiedTime: foundMonth ? foundMonth.totalStudiedTime : 0
            });
        }

        months.reverse();
        res.status(200).json(months);
    } catch (error) {
        console.error('Error fetching pomodori:', error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getPomodori,
    getPomodoriToDo,
    addPomodoro,
    editPomodoro,
    deletePomodoro,
    updateCycles,
    addAdditionalCycle,
    getPomodoroById,
    totalStudiedTime,
    timePomodoriMonths
};