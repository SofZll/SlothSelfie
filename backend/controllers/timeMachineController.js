const setTime = async (req, res) => {
    try {
        const { date, time } = req.body;
        const timestamp = new Date(`${date}T${time}:00Z`);

        // Saving the time in the database

        res.json({ success: true, message: 'State set' });
    } catch (error) {
        console.error('Error setting state:', error);
        res.status(500).json({ success: false, message: 'Error setting state' });
    }
};

const resetTime = async (req, res) => {
    try {
        // Resetting the time in the database

        res.json({ success: true, message: 'State reset' });
    } catch (error) {
        console.error('Error resetting state:', error);
        res.status(500).json({ success: false, message: 'Error resetting state' });
    }
};

// Function to fetch the state given a specific date and time
const fetchState = async (req, res) => {
    try {
        const { date, time } = req.query;
        const timestamp = new Date(`${date}T${time}:00Z`);

        // Fetching stuffs from the database
        // const events = await db.query('SELECT * FROM events WHERE ...', [timestamp]);

    } catch (error) {
        console.error('Error fetching state:', error);
        res.status(500).json({ success: false, message: 'Error fetching state' });
    }
};

module.exports = {
    fetchState,
    setTime,
    resetTime,
};