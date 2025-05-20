
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Note = require('../models/noteModel');
const { sendExportEmail } = require('../utils/utils');
const { createEvent } = require('ics'); // Import the library for iCalendar generation
const { getCurrentNow } = require('../services/timeMachineService');

// fetch all tasks
const getTasks = async (req, res) => {
    const userName = req.session.username;
    const user = await User.findOne({ username: userName });
    const now = getCurrentNow();
    
    try {
        const tasks = await Task.find({
            $or: [
                { user: user._id },
                { sharedWith: user._id },
            ],
            createdAt: { $lte: now }
        })
        .populate('user', 'username')
        .populate('sharedWith', 'username')
        .lean();

        const transformedTasks = tasks.map(task => {
            return {
                ...task,
                sharedWith: task.sharedWith.map(user => user.username)
            }
        });

        res.status(200).json({ success: true, tasks: transformedTasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: error.message });
    }
};

//edit a given task
const editTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, deadline, completed } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task.title = title;
        task.deadline = deadline;
        task.completed = completed;
        task.updatedAt = getCurrentNow();

        const updatedTask = await task.save();
        updatedTask.sharedWith = updatedTask.sharedWith.map(user => user.username);
        res.status(200).json({ success: true, task: updatedTask });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: error.message });
    }
}

// change task completed value
const markTaskCompleted = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task.completed = !task.completed;
        task.updatedAt = getCurrentNow();

        const updatedTask = await task.save();
        res.status(200).json({ success: true, task: updatedTask });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        const note = await Note.findOne({ tasks: taskId });
        if (note) {
            note.tasks = note.tasks.filter(task => task._id !== taskId);
            await note.save();
        }

        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//function to delete user from share with
const deleteUserFromShareWith = async (userId, tasks) => {
    try {
        for (let i = 0; i < tasks.length; i++) {
            const task = await Task.findById(tasks[i]._id);
            if (!task) {
                console.error('Task not found:', tasks[i]._id, task, tasks[i]);
                return false;
            }

            task.sharedWith = task.sharedWith.filter(user => user.toString() !== userId.toString());
            const updatedTask = await task.save();
            if (!updatedTask) return false;
        }
        return true;
    } catch (error) {
        console.error('Error deleting user from shared tasks:', error);
        return false;
    }
}

//function called from note to delete tasks
const deleteTasks = async (tasks) => {
    try {
        for (let i = 0; i < tasks.length; i++) {
            const deletedTask = await Task.findByIdAndDelete(tasks[i]._id);
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

//function called from note to add tasks
const addTasks = async (tasks, user, sharedWith) => {
    const tasksArray = [];

    try {
        for (let i = 0; i < tasks.length; i++) {
            const task = new Task({ title: tasks[i].title, completed: tasks[i].completed, user: user._id, createdAt: getCurrentNow(), updatedAt: getCurrentNow() });
            if (tasks[i].deadline) task.deadline = tasks[i].deadline;
            if (sharedWith.length > 0) task.sharedWith = sharedWith;

            const savedTask = await task.save();
            if (savedTask) tasksArray.push(savedTask._id);
        }

        return tasksArray;
    } catch (error) {
        console.error('Error creating tasks:', error);
        return false;
    }
}

//function called from note to edit tasks
const editTasks = async (tasks, users) => {
    const updatedTasks = [];
    try {
        for (let i = 0; i < tasks.length; i++) {
            const task = await Task.findById(tasks[i]._id);
            if (!task) return false;

            task.title = tasks[i].title;
            task.deadline = tasks[i].deadline;
            task.completed = tasks[i].completed;
            task.sharedWith = users;
            task.updatedAt = getCurrentNow();

            const updatedTask = await task.save();
            if (!updatedTask) return false;
            else updatedTasks.push(updatedTask._id);
        }

        return updatedTasks;
    } catch (error) {
        console.error('Error updating tasks:', error);
        return false;
    }
}

//Function to export tasks on iCalendar (using library: ics.js)
async function exportTask(req, res){
    try {
        const {taskId} = req.params;
        const userName = req.session.username;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const user = await User.findOne({ username: userName });

        const { error, value } = createEvent({
            title: task.title,
            description: '',
            start: [
                task.deadline.getFullYear(),
                task.deadline.getMonth() + 1,
                task.deadline.getDate(),
            ]
        });
        
        if (error) {
            console.error("ICS generation error:", error);
            return res.status(500).json({ success: false, message: 'Error generating ICS file' });
        }

        // send the mail with the .ics file as attachment to the user
        const userEmail = user.email;
        
        await sendExportEmail(
            userEmail,
            `${task.title}.ics`,
            value
        );
            
        //download the file on frontend
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="${task.title}.ics"`);
        res.status(200).send(value);
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: 'Error exporting task' });
    }
}

module.exports = {
    getTasks,
    editTask,
    deleteTask,
    markTaskCompleted,
    deleteTasks,
    deleteUserFromShareWith,
    addTasks,
    editTasks,
    exportTask
};