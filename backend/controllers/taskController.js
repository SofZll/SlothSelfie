
const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Creating a task
const createTask = async (req, res) => {
    const { text, deadline } = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ user: userName });

    try {
        const task = new Task({ text, deadline, completed:false, user: user._id });
        const savedTask = await task.save();
        res.status(200).json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: error.message });
    }
};

// change task completed value
const markTaskCompleted = async (req, res) => {
    const { taskId } = req.params;
    const userName = req.session.username;
    const user = await User.findOne({ user: userName });

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this task' });
        }

        task.completed = !task.completed;
        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: error.message });
    }
};

// fetch all tasks
const getTasks = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ user: userName });
    
    try {
        const tasks = await Task.find({ user: user._id });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: error.message });
    }
};

// get a single task by id
const getTaskById = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: error.message });
    }
};
   
// Update a task
const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, deadline, completed } = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ user: userName });
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this task' });
        }
        //update the task
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { title, deadline, completed },
            { new: true }
        );
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    getTaskById,
    markTaskCompleted
};