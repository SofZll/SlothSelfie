const User = require('../models/userModel');

// TODO: implement a hashing function to store passwords securely
// TODO: implement the possibility to change the password

// Log in a user: FUNZIONA
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {

        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Compare the stored password with the input password
        console.log(`Stored password: ${user.password}`);
        if (password !== user.password) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        req.session.userId = user._id.toString();
        console.log('Session UserId:', req.session.userId);
        req.session.username = user.username;
        console.log('Session Username:', req.session.username);

        await req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
            }
        });

        console.log('Session ID after login:', req.sessionID); // Debugging line
        console.log('Session after login:', req.session); // Debugging line

        res.status(200).json({ success: true, user });
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

        // Create a new user
        const newUser = new User({ name, username, email, password });
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
    try {
        const userId = req.session.userId;
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

//Fetch user's no availability time intervals
 const getNoAvailability = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User not logged in' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, noAvailability: user.noAvailability });
    } 
    catch (error) {
        console.error('Error fetching no availability:', error);
        res.status(500).json({ success: false, message: 'Error fetching no availability' });
    }
}

// Add time intervals for no availability for group events
 const addNoAvailability = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { startDate, endDate, repeatFrequency } = req.body;
        const newNoAvailability = { startDate, endDate, repeatFrequency };
        const user = await User.findById(userId);
        console.log('Received data:', req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.noAvailability.push({ startDate, endDate, repeatFrequency });
        await user.save();
        res.status(200).json({ success: true, noAvailability: newNoAvailability, message: 'No availability added successfully' });
    }
    catch (error) {
        console.error('Error adding no availability:', error);
        res.status(500).json({ success: false, message: 'Error adding no availability' });
    }
}

//Remove time intervals for no availability for group events
const removeNoAvailability = async (req, res) => {
    try {
        const { noAvailabilityId } = req.params;  //id of the time interval to remove
        const userId = req.session.userId;
        // find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Remove the specified no availability time interval
        const noAvailabilityIndex = user.noAvailability.findIndex(item => item._id.toString() === noAvailabilityId);
        if (noAvailabilityIndex === -1) {
            return res.status(404).json({ success: false, message: 'No availability not found' });
        }

        user.noAvailability.splice(noAvailabilityIndex, 1);  //remove the no availability time interval from the array
        await user.save();

        res.status(200).json({ success: true, message: 'No availability removed successfully' });
    } catch (error) {
        console.error('Error removing no availability:', error);
        res.status(500).json({ success: false, message: 'Error removing no availability' });
    }
};

// Route to get the userId from the username
const getUserIdFromUsername = async (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    try {
        // find the user
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Restituisci l'ID dell'utente
        res.status(200).json({ success: true, userId: user._id.toString() });
    } catch (error) {
        console.error('Error fetching userId from username:', error);
        res.status(500).json({ success: false, message: 'Error fetching userId' });
    }
};

//route to get the no availability time intervals of a user given the userId
const getUserNoAvailabilityWithId = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    try {
        // find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Return the no availability time intervals of the user
        res.status(200).json({ success: true, noAvailability: user.noAvailability });
    } catch (error) {
        console.error('Error fetching no availability with userId:', error);
        res.status(500).json({ success: false, message: 'Error fetching no availability' });
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
    getNoAvailability,
    addNoAvailability,
    removeNoAvailability,
    getUserIdFromUsername,
    getUserNoAvailabilityWithId,
};