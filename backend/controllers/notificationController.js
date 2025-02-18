const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');
const agenda = require('../jobs/agenda');

/**
 * La funzione createNotification si occupa di creare una nuova notifica e di salvarla nel database.
 * @param {*} req contiene i dati della notifica da creare: elementId, receivers, message, dateNotif, frequencyNotif, type.
 * @param {*} res contiene la risposta da inviare al client.
 * @param {*} internalCall controlla se la chiamata è stata fatta internamente o meno, è di default false.
 */
const createNotification = async (req, res, internalCall = false) => {
    let elementId, receivers, message;

    console.log('Request Body:', req.body);
    console.log('Internal Call:', internalCall);

    if (internalCall) ({ elementId, receivers, message, dateNotif, frequencyNotif, type } = req)
    else {
        ({ receivers, message } = req.body);
        elementId = null;
        dateNotif = null;
        frequencyNotif = null;
        type = 'OS';
    }

    console.log({ elementId, receivers, message, dateNotif, frequencyNotif, type });
    try {
        const notificationData = internalCall ? await getDataInternal({ elementId }) : await getDataStandard({ receivers, message });
        const { message: messageVal, receiversObjectId, element, elementType, deadline} = notificationData;
        const senderUsername = internalCall ? element.user.username : req.session.username;
        const senderUser = await User.findOne({ username: senderUsername });

        const notificationType = Object.keys(type).filter(key => type[key] === true);

        let notificationDate;
        if (dateNotif) notificationDate = new Date(dateNotif).toISOString();
        else notificationDate = new Date().toISOString();

        const notification = new Notification({
            sender: senderUser._id,
            receivers: receiversObjectId,
            type: notificationType,
            message: messageVal,
            createdAt: new Date().toISOString(),
            read: receiversObjectId.map(() => false),
            element: elementId ? elementId : null,
            elementType: elementType ? elementType : null,
            dateNotif: notificationDate,
            frequencyNotif: frequencyNotif,
            responses: [],
        });
        
        console.log(notification);
        await notification.save();

        // creazione schedule della notifica in base alla data di notifica e alla frequenza
        if (notificationDate) {
            await agenda.schedule(notificationDate, 'send notification', {
                notificationId: notification._id,
            });
            console.log(`Scheduled job 'send notification' at ${notificationDate}`);
        } else {
            await agenda.now('send notification', {
                notificationId: notification._id,
            });
            console.log(`Scheduled job 'send notification' now`);
        }

        if (frequencyNotif != 'none') {
            if (frequencyNotif == 'three') {
                const endDate = new Date(deadline).toISOString();
                const repetition = 3;
                await scheduleMultipleNotifications(agenda, startDate = notificationDate, endDate, repetition, 'send notification', {
                    notificationId: notification._id,
                });
            } else if (frequencyNotif == 'untilAnswer') {
                // TODO: logica personalizzata per untilAnswer
                await agenda.every('1 hour', 'send notification', {
                    notificationId: notification._id,
                });
            } else {
                await agenda.every(frequencyNotif, 'send notification', {
                    notificationId: notification._id,
                });
            }
        }

        if (!internalCall) res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        if (!internalCall) res.status(500).json({ success: false, message: 'Error creating notification' });
    }
}

const getDataInternal = async ({ elementId }) => {
    let element, date, type;

    element = await Activity.findOne({ _id: elementId }).populate('user').populate('sharedWith');

    if (element) {
        date = new Date(element.deadline);
        type = 'Activity';
    } else {
        element = await Event.findOne({ _id: elementId }).populate('user').populate('sharedWith');
        if (element) {
            date = new Date(element.date);
            type = 'Event';
        }
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
        elementType: type,
        deadline: date,
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
    };
}

/**
 * La funzione scheduleMultipleNotifications si occupa di creare e gestire la programmazione di più notifiche.
 * La data della notifica viene calcolata distribuendo le notifiche uniformemente, in base al numero di ripetizioni e alla data di inizio e fine.
 * @param {*} agenda indica l'istanza di Agenda
 * @param {*} startDate indica la data di inizio
 * @param {*} endDate indica la data di fine
 * @param {*} repetitions indica il numero di ripetizioni
 * @param {*} jobName indica la tipologia di job da eseguire
 * @param {*} data un oggetto contenente i dati della notifica
 */
const scheduleMultipleNotifications = async (agenda, startDate, endDate, repetitions, jobName, data) => {
    const end = new Date(endDate).toISOString();
    const totMinutes = (end - new Date(startDate).toISOString()) / 60000;
    const interval = totMinutes / (repetitions -1);

    for (let i = 0; i < repetitions; i++) {
        let date = new Date(startDate).toISOString();
        date.setMinutes(date.getMinutes() + interval * i);

        if ( i == repetitions - 1) {
            date.setMinutes(date.getMinutes() + 60);
        }
        console.log('Date:', date);

        await agenda.schedule(date, jobName, data);
        console.log(`Scheduled job ${jobName} at ${date}`);
    }
}

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
            // TODO: logica personalizzata per Accepted
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