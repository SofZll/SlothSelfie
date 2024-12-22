const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');
const socket = require('../socket/socket');

// Create a new notification: FUNZIONA
const createNotification = async (req, res, internalCall = false) => {
    let activityId, eventId, receivers, message;

    console.log('Request Body:', req.body);
    console.log('Internal Call:', internalCall);

    if (internalCall) ({ activityId, eventId, receivers, message, dateNotif, frequencyNotif, type } = req)
    else {
        ({ activityId, eventId, receivers, message } = req.body);
        dateNotif = null;
        frequencyNotif = null;
        type = 'OS';
    }

    console.log({ activityId, eventId, receivers, message, dateNotif, frequencyNotif, type });
    try {
        const notificationData = internalCall ? await getDataInternal({ activityId, eventId }) : await getDataStandard({ receivers, message });
        const { message: messageVal, receiversObjectId, element } = notificationData;
        const senderUsername = internalCall ? element.user.username : req.session.username;
        const senderUser = await User.findOne({ username: senderUsername });

        const notificationType = Object.keys(type).filter(key => type[key] === true);

        const notificationDate = new Date(dateNotif);

        const notification = new Notification({
            sender: senderUser._id,
            receivers: receiversObjectId,
            type: notificationType,
            message: messageVal,
            createdAt: new Date(),
            read: receiversObjectId.map(() => false),
            activity: activityId ? activityId : null,
            event: eventId ? eventId : null,
            dateNotif: notificationDate,
            frequencyNotif: frequencyNotif,
            responses: [],
        });
        // creazione notifica schedule

        console.log(notification);
        await notification.save();

        emitNotification(receiversObjectId, messageVal);

        if (!internalCall) res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        if (!internalCall) res.status(500).json({ success: false, message: 'Error creating notification' });
    }
}

const emitNotification = (receivers, message) => {
    const io = socket.getIO();
    if (!io) {
        console.error("Socket.IO instance not found.");
        return;
    }

    io.emit('send-notification', {
        receivers,
        message,
    });
};

const getDataInternal = async ({ activityId, eventId }) => {
    let element, date, type;

    if (activityId) {
        element = await Activity.findOne({ _id: activityId }).populate('user').populate('sharedWith');
        date = new Date(element.deadline);
        type = 'Activity';
    }
    else if (eventId) {dateNotif
        element = await Event.findOne({ _id: eventId }).populate('user').populate('sharedWith');
        date = new Date(element.date);
        type = 'Event';
    }
    if (!element) return null;

    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const message = `${type}: ${element.title} - Date: ${formattedDate}`;

    receiversObjectId = [];
    receiversObjectId.push(element.user._id);
    if (element.sharedWith != []) {
        for (const receiver of element.sharedWith) {
            receiversObjectId.push(receiver._id);
        }
    }

    return {
        message,
        receiversObjectId,
        element,
    }
}

const getDataStandard = async ({ receivers, message }) => {
    if (!receivers || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const receiversObjectId = [];
    for (const receiver of receivers) {
        const receiverUser = await User.findOne({ username: receiver });
        if (!receiverUser) {
            return res.status(400).json({ success: false, message: `Invalid receiver username: ${receiver}` });
        }
        receiversObjectId.push(receiverUser._id);
    }

    return {
        message,
        receiversObjectId,
        activity: null,
        event: null,
    };
}

// Get all notifications: FUNZIONA
const getNotifications = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid user' });
        }
        
        const notifications = await Notification.find({ receivers: user._id }).populate('sender', 'username').populate('receivers', 'username');

        const notificationsWithDate = notifications.map(notification => ({
            ...notification.toObject(),
            date: notification.createdAt
        }));

        res.status(200).json({ success: true, notifications: notificationsWithDate });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
}

// Mark a notification as read: FUNZIONA
const markNotificationAsRead = async (req, res) => {
    try {
        const { notifId } = req.params;
        const username = req.session.username;
        const notification = await Notification.findById(notifId);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        const receiver = await User.findOne({ username });
        const receiverIndex = notification.receivers.findIndex(r => r.equals(receiver._id));

        if (receiverIndex === -1) {
            return res.status(400).json({ success: false, message: 'User is not a receiver of the notification' });
        }

        notification.read[receiverIndex] = true;
        await notification.save();

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Error marking notification as read' });
    }
}

const markNotificationStatus = async (req, res) => {
    try {
        const { notifId } = req.params;
        const { status } = req.body;
        const username = req.session.username;

        const notification = await Notification.findById(notifId);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        const receiver = await User.findOne({ username });
        const receiverIndex = notification.responses.findIndex(r => r.receiver.equals(receiver._id));

        if (receiverIndex !== -1) {
            return res.status(400).json({ success: false, message: 'Response has already been submitted' });
        }

        notification.responses.push({ receiver: receiver._id, status });
        await notification.save();

        if (status === 'Accepted') {
            // come dovrei assegnare gli eventi e le attività ai vari utenti?
            // - se l'evento/attività è stata creata da un utente, allora l'utente che ha accettato la notifica diventa il proprietario dell'evento/attività
            // - creazione di un nuovo evento?
            // - campo aggiuntivo che indica gli utenti che hanno accettato
        }

        res.status(200).json({ success: true, message: 'Notification status marked' });
    } catch (error) {
        console.error('Error marking notification status:', error);
        res.status(500).json({ success: false, message: 'Error marking notification status' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const username = req.session.username;
        const user = await User.findOne({ username });

        const notifications = await Notification.find({ receivers: user._id });

        for (const notification of notifications) {
            const receiverIndex = notification.receivers.findIndex(r => r.equals(user._id));
            notification.read[receiverIndex] = true;
            await notification.save();
        }

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error){
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Error marking all notifications as read' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markNotificationStatus,
    markAllAsRead,
};