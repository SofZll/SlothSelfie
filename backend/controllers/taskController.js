
const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Creating a task
const createTask = async (req, res) => {
    const { title, deadline, completed } = req.body;
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });

    try {
        const task = new Task({ title, completed, user: user._id });
        if (deadline) task.deadline = deadline;

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

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
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
        const tasks = await Task.find({
            $or: [
                { user: user._id },
                { sharedWith: user._id }
            ]
        })
        .populate('user', 'username')
        .populate('sharedWith', 'username');

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

const addTasks = async (tasks, user, sharedWith) => {

    try {
        for (let i = 0; i < tasks.length; i++) {
            const task = new Task({ title: tasks[i].title, completed: tasks[i].completed, user: user._id });
            if (tasks[i].deadline) task.deadline = tasks[i].deadline;
            if (tasks[i].sharedWith) task.sharedWith = sharedWith;

            const savedTask = await task.save();
            if (!savedTask) {
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Error creating tasks:', error);
        return false;
    }
}


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
    deleteTasks,
    addTasks,
};