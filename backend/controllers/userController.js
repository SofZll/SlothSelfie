const User = require('../models/userModel');

// TODO: implement a hashing function to store passwords securely
// TODO: implement the possibility to change the password

// Function to log in a user
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {

        // Check if the user exists
        const user = await User.findOne({ username});
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
        console.log('Full Session Object:', req.session);
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
            }
        });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, message: 'Error logging in user' });
    }
};

// Function to register a new user
const registerUser = async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
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

// Function to log out a user
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

// Function to edit the user's profile image
const editImage = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.image.data = req.file.buffer;
        user.image.contentType = req.file.mimetype;
        await user.save();

        res.status(200).json({ success: true, message: 'Image uploaded successfully' });
    } catch (error) {
        console.error('Error editing image:', error);
        res.status(500).json({ success: false, message: 'Error editing image' });
    }
};

// Function to edit the user's profile
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

// Function to get the profile info
const getUserProfile = async (req, res) => {
    try {
        console.log('Full Session Object:', req.session);
        const username = req.session.username;
        console.log('Session UserId:', username);
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username not found' });
        }
        const user = await User.fondOne({ username});
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching user profile' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    getUserProfile,
    editImage,
    editProfile,
};