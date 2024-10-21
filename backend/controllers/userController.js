const User = require('../models/userModel');

// TODO: implement a hashing function to store passwords securely

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

        req.session.userId = user._id;
        req.session.username = user.username;

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

// Function to get the profile image
const getUserImage = async (req, res) => {
    try {
        // Fetch the user and check if the image exists
        const user = await User.findById(req.params.userId);
        if (!user || !user.image || !user.image.data) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }

        res.set('Content-Type', user.image.contentType);
        res.send(user.image.data);
    } catch (error) {
        console.error('Error fetching user image:', error);
        res.status(500).json({ success: false, message: 'Error fetching user image' });
    }
};


module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    getUserImage
};