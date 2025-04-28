const bcrypt = require('bcrypt');
const User = require('../models/userModel');

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
        console.log('isMatch:', isMatch);
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
        console.log('Requested URL:', req.originalUrl);
        console.log('params:', req.params);
        console.log("Requested userId:", req.params.userId);
        console.log("Session userId:", req.session.userId);
        console.log("Final userId to search:", userId);


        if (!userId) {
            return res.status(400).json({ success: false, message: 'UserId not found' });
        }
        console.log('UserId:', userId);
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
        console.log('Username:', username);
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
        console.log('UserId:', userId);
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
};