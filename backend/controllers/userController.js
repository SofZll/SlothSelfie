const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const NoAvailability = require('../models/noAvailabilityModel');
const { getToolEvents } = require('../controllers/eventController');
const { getNoAvailabilitiesTool } = require('../controllers/noAvailabilityController');

// TODO: implement the possibility to change the password

// Log in a user: FUNZIONA
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        const userData = {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
        };

        res.status(200).json({ success: true, user: userData });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, message: 'Error logging in user' });
    }
};

// Register a new user: FUNZIONA
const registerUser = async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username }); 
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ name, username, email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
};

// Log out a user: FUNZIONA
const logoutUser = async (req, res) => {
    try {
        // Destroy the session and clear the cookie
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error logging out' });
            }
            res.clearCookie('sid');
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ success: false, message: 'Error logging out' });
    }
};

// Edit the user's profile image: FUNZIONA
const editImage = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.image = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };
        await user.save();

        res.status(200).json({ success: true, message: 'Image uploaded successfully' });
    } catch (error) {
        console.error('Error editing image:', error);
        res.status(500).json({ success: false, message: 'Error editing image' });
    }
};

// Edit the user's profile: FUNZIONA
const editProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { name, email, birthday, phoneNumber, gender } = req.body;
        user.name = name;
        user.email = email;
        user.birthday = birthday;
        user.phoneNumber = phoneNumber;
        user.gender = gender;
        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error editing profile:', error);
        res.status(500).json({ success: false, message: 'Error editing profile' });
    }
};

// Get the profile info: FUNZIONA
const getUserProfile = async (req, res) => {
    let userId = req.params.userId;

    try {
        if (!userId || userId === 'undefined') {
            userId = req.session.userId;
        }

        if (!userId) {
            return res.status(400).json({ success: false, message: 'UserId not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching user profile' });
    }
};

// Get the username: FUNZIONA
const getUsername = async (req, res) => {
    try {
        const username = req.session.username;
        
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username not found' });
        }
        res.status(200).json({ success: true, username: username });
    } catch (error) {
        console.error('Error fetching username:', error);
        res.status(500).json({ success: false, message: 'Error fetching username' });
    }
};

// Get the userId from the session
const getUserId = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'UserId not found' });
        }
        res.status(200).json({ success: true, userId: userId });
    } catch (error) {
        console.error('Error fetching userId:', error);
        res.status(500).json({ success: false, message: 'Error fetching userId' });
    }
}

// Check if the user is logged in
const checkAuth = async (req, res) => {
    try {
        if (req.session.userId) {
            return res.status(200).json({ success: true, message: 'User is logged in' });
        }
        res.status(401).json({ success: false, message: 'User is not logged in' });
    } catch (error) {
        console.error('Error checking authentication:', error);
        res.status(500).json({ success: false, message: 'Error checking authentication' });
    }
}


// Route to get the userId from the username
const getUserIdFromUsername = async (req, res) => {
    const { username } = req.params;

    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    try {
        const user = await User.findOne({ username: username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.isRoom) return res.status(200).json({ success: true, isTool: true, message: 'User is a room' });
        if (user.isDevice) return res.status(200).json({ success: true, isTool: true, message: 'User is a device' });
        
        if (user.isAdmin) return res.status(400).json({ success: false, message: 'User is an administrator' });

        // Restituisci l'ID dell'utente
        res.status(200).json({ success: true, userId: user._id.toString() });
    } catch (error) {
        console.error('Error fetching userId from username:', error);
        res.status(500).json({ success: false, message: 'Error fetching userId' });
    }
};


// Function to update the user schedule settings preferences
const updateUserPreferences = async (req, res) => {
    const { userId } = req.session;
    const { workingHours, daysOff, dayHour } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Updates the preferences
        user.workingHours.start = workingHours.start || user.workingHours.start;
        user.workingHours.end = workingHours.end || user.workingHours.end;
        user.freeDays = daysOff || user.freeDays;
        user.dayHours.start = dayHour.start || user.dayHours.start;
        user.dayHours.end = dayHour.end || user.dayHours.end;

        await user.save();
        res.json({ success: true, workingHours: user.workingHours, freeDays: user.freeDays, dayHours: user.dayHours });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user preferences' });
    }
};

const switchNotification = async (req, res) => {
    const { userId } = req.session;
    const { field, value } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // disable notifications
        user.disableNotifications[field] = value;
        
        await user.save();
        res.json({ success: true, disableNotifications: user.disableNotifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user preferences' });
    }
};

// Get the tools of the user
const getUsersTools = async (req, res) => {
    try {
        const rooms = await User.find({ isRoom: true }).lean();
        const devices = await User.find({ isDevice: true }).lean();

        if (!rooms && !devices) {
            return res.status(404).json({ success: false, message: 'No tools found' });
        }

        // Get the events and no availability for each room and device
        for (const room of rooms) {
            const events = await getToolEvents(room._id);
            const availabilities = await getNoAvailabilitiesTool(room._id);
            if (events.success) room.events = events.events;
            else {
                room.events = [];
                console.log('Error fetching events for room:', room._id);
            }

            if (availabilities.success) room.availabilities = availabilities.noAvailability;
            else {
                room.availabilities = [];
                console.log('Error fetching availabilities for room:', room._id);
            }
            room.type = 'room';
        }

        for (const device of devices) {
            const events = await getToolEvents(device._id);
            const availabilities = await getNoAvailabilitiesTool(device._id);
            if (events.success) device.events = events.events;
            else {
                device.events = [];
                console.log('Error fetching events for device:', device._id);
            }

            if (availabilities.success) device.availabilities = availabilities.noAvailability;
            else {
                device.availabilities = [];
                console.log('Error fetching availabilities for device:', device._id);
            }
            device.type = 'device';
        }


        res.status(200).json({ success: true, rooms, devices });
    } catch (error) {
        console.error('Error fetching tools:', error);
        res.status(500).json({ success: false, message: 'Error fetching tools' });
    }
}

// Add a room
const addRoom = async (req, res) => {
    const { userId } = req.session;
    const { username, dayHours, freeDays } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        } else if (!user.isAdmin) {
            return res.status(400).json({ success: false, message: 'User is not an admin' });
        }

        const room = new User({ username, isRoom: true, password: user.password, dayHours, freeDays, workingHours: dayHours });
        await room.save();

        res.status(201).json({ success: true, room });
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ success: false, message: 'Error adding room' });
    }   
}

// Add a device
const addDevice = async (req, res) => {
    const { userId } = req.session;
    const { username, dayHours, freeDays } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        } else if (!user.isAdmin) {
            return res.status(400).json({ success: false, message: 'User is not an admin' });
        }

        const device = new User({ username, isDevice: true, password: user.password, dayHours, freeDays, workingHours: dayHours });
        await device.save();

        res.status(201).json({ success: true, device });
    } catch (error) {
        console.error('Error adding device:', error);
        res.status(500).json({ success: false, message: 'Error adding device' });
    }
}

// Edit a room
const editRoom = async (req, res) => {
    const { userId } = req.session;
    const { roomId } = req.params;
    const { username, dayHours, freeDays } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        } else if (!user.isAdmin) {
            return res.status(400).json({ success: false, message: 'User is not an admin' });
        }

        const room = await User.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        room.username = username;
        room.dayHours = dayHours;
        room.freeDays = freeDays;
        room.workingHours = dayHours;
        await room.save();

        res.status(200).json({ success: true, room });
    } catch (error) {
        console.error('Error editing room:', error);
        res.status(500).json({ success: false, message: 'Error editing room' });
    }
}

// Edit a device
const editDevice = async (req, res) => {
    const { userId } = req.session;
    const { deviceId } = req.params;
    const { username, dayHours, freeDays } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        } else if (!user.isAdmin) {
            return res.status(400).json({ success: false, message: 'User is not an admin' });
        }

        const device = await User.findById(deviceId);
        if (!device) {
            return res.status(404).json({ success: false, message: 'Device not found' });
        }

        device.username = username;
        device.dayHours = dayHours;
        device.freeDays = freeDays;
        device.workingHours = dayHours;
        await device.save();

        res.status(200).json({ success: true, device });
    } catch (error) {
        console.error('Error editing device:', error);
        res.status(500).json({ success: false, message: 'Error editing device' });
    }
}

// Delete a room
const deleteRoom = async (req, res) => {
    const { roomId } = req.params;

    try {
        const room = await User.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const events = await getToolEvents(room._id);
        const availabilities = await getNoAvailabilitiesTool(room._id);

        if (events.success) {
            for (const event of events.events) {
                await Event.findByIdAndUpdate(event._id, { $pull: { sharedWith: room._id } });
            }
        } else return res.status(404).json({ success: false, message: 'Events not found' });

        if (availabilities.success) {
            for (const availability of availabilities.noAvailability) {
                await NoAvailability.findByIdAndDelete(availability._id);
            }
        } else return res.status(404).json({ success: false, message: 'No availabilities not found' });

        await User.findByIdAndDelete(roomId);

        res.status(200).json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ success: false, message: 'Error deleting room' });
    }
}

// Delete a device
const deleteDevice = async (req, res) => {
    const { deviceId } = req.params;

    try {
        const device = await User.findById(deviceId);
        if (!device) {
            return res.status(404).json({ success: false, message: 'Device not found' });
        }

        const events = await getToolEvents(device._id);
        const availabilities = await getNoAvailabilitiesTool(device._id);

        if (events.success) {
            for (const event of events.events) {
                await Event.findByIdAndUpdate(event._id, { $pull: { sharedWith: device._id } });
            }
        } else return res.status(404).json({ success: false, message: 'Events not found' });

        if (availabilities.success) {
            for (const availability of availabilities.noAvailability) {
                await NoAvailability.findByIdAndDelete(availability._id);
            }
        } else return res.status(404).json({ success: false, message: 'No availabilities not found' });

        await User.findByIdAndDelete(deviceId);

        res.status(200).json({ success: true, message: 'Device deleted successfully' });
    } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).json({ success: false, message: 'Error deleting device' });
    }
}


module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    getUserProfile,
    editImage,
    editProfile,
    getUsername,
    getUserId,
    checkAuth,
    getUserIdFromUsername,
    updateUserPreferences,
    switchNotification,
    getUsersTools,
    addRoom,
    addDevice,
    editRoom,
    editDevice,
    deleteRoom,
    deleteDevice,
};