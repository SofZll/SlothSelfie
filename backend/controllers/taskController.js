
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Note = require('../models/noteModel');
const { createEvent } = require('ics'); // Import the library for iCalendar generation

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

//edit a given task
const editTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, deadline, completed } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.title = title;
        task.deadline = deadline;
        task.completed = completed;

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
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

// Delete a task
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        const note = await Note.findOne({ tasks: taskId });
        if (note) {
            note.tasks = note.tasks.filter(task => task._id !== taskId);
            await note.save();
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: error.message });
    }
};

//function called from note to add tasks
const addTasks = async (tasks, user, sharedWith) => {
    const tasksArray = [];

    try {
        for (let i = 0; i < tasks.length; i++) {
            const task = new Task({ title: tasks[i].title, completed: tasks[i].completed, user: user._id });
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

//function called from note to edit tasks
const editTasks = async (tasks) => {
    const updatedTasks = [];
    try {
        for (let i = 0; i < tasks.length; i++) {
            const task = await Task.findById(tasks[i]._id);
            if (!task) return false;

            task.title = tasks[i].title;
            task.deadline = tasks[i].deadline;
            task.completed = tasks[i].completed;

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
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

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
            return res.status(500).json({ message: 'Error while generating .ics' });
        }

        console.log("Generated .ics value:\n", value);
    
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="${task.title}.ics"`);
        res.status(200).send(value);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error during the task export' });
      }
}

module.exports = {
    getTasks,
    editTask,
    deleteTask,
    markTaskCompleted,
    deleteTasks,
    addTasks,
    editTasks,
    exportTask
};