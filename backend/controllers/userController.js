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

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, message: 'Error logging in user' });
    }
};

// Function to register a new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({ username, email, password });
        await newUser.save();
        
        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
};

module.exports = {
    loginUser,
    registerUser,
};