
const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Creating a task
const createTask = async (req, res) => {
    const { text, deadline, completed } = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        let task;
        if (deadline) {
            task = new Task({ text, deadline, completed, user: user._id });
        } else {
            task = new Task({ text, completed, user: user._id });
        }
        const savedTask = await task.save();
        console.log(savedTask);
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
    const user = await User.findOne({ username: userName });

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
    const user = await User.findOne({ username: userName });
    
    try {
        const tasks = await Task.find({ username: user._id });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
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


const deleteTasks = async (idTasks) => {
    try {
        for (let i = 0; i < idTasks.length; i++) {
            const deletedTask = await Task.findByIdAndDelete(idTasks[i]);
            if (!deletedTask) {
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Error deleting tasks:', error);
        return false;
    }
}

module.exports = {
    createTask,
    getTasks,
    deleteTask,
    markTaskCompleted,
    deleteTasks
};