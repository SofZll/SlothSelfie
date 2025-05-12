const Notification = require('../models/notificationModel');
const Event = require('../models/eventModel');
const Activity = require('../models/activityModel');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const webPush = require('web-push');
const nodemailer = require('nodemailer');
const { getIO } = require('../socket/socket');

const sendSystemNotification = async (notification) => {
    // internal notification
    const io = getIO();
    const user = await User.findById(notification.user._id);
    if (!user) {
        console.error('User not found:', notification.user._id);
        return;
    }

    let element;
    if (notification.elementType === 'Activity') element = await Activity.findById(notification.element);
    else if (notification.elementType === 'Event') element = await Event.findById(notification.element);

    let body = '';
    if (notification.type != 'now') {
        body = `il tuo ${notification.elementType} "${element.title}" scade il ${new Date(notification.to).toLocaleString()}`;
    } else if (notification.urgency === true) {
        body = `la tua attività "${element.title}" è in ritardo!!`; 
    } else {
        body = `il tuo ${notification.elementType} "${element.title}" è stato modificato`;
    }

    const payload = {
        title: element.title,
        body,
        notificationId: notification.id,
        elementId: notification.element,
        elementType: notification.elementType,
        url: 'http://localhost:3000',
        urgency: notification.urgency,
    };

    io.to(user.id).emit('system-notification', payload);
    console.log('Sending system notification:', payload);

    // web push notification
    webPush.setVapidDetails(
        'mailto:kaorijiang88@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
    );

    const subscriptions = await Subscription.find({ user: user._id });
    subscriptions.forEach(subscription => {
        const pushPayload = JSON.stringify(payload);

        console.log('subscription:', subscription);
        webPush.sendNotification(subscription.subscription, pushPayload)
            .then(() => console.log('Notification sent'))
            .catch(error => console.error('Error sending notification:', error));
    });
}

const sendEmailNotification = async (notification) => {
    console.log('Sending email notification:', notification);

    const receiver = await User.findById(notification.user);
    if (!receiver) {
        console.error('Receiver not found:', notification.user);
        return;
    }

    let element;
    if (notification.elementType === 'Activity') element = await Activity.findById(notification.element);
    else if (notification.elementType === 'Event') element = await Element.findById(notification.element);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    let subjectContent, htmlContent;

    if (notification.elementType === 'Event') {
        subjectContent = `Friendly Reminder: The Event ${element.title} is Coming Up!`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4CAF50;">📅 Reminder: ${element.title}</h2>
                <p>Hey <strong>${receiver.username}</strong>,</p>
                <p>Your event is coming up soon! Here are the details:</p>
                <ul>
                    <li><strong>Date:</strong> ${element.date}</li>
                    <li><strong>Time:</strong> ${element.time}</li>
                    <li><strong>Location:</strong> ${element.eventLocation}</li>
                </ul>
                <p>Make sure to be there! </p>
                <p><a href="http://localhost:3000" style="display:inline-block; background-color:#4CAF50; color:white; text-decoration:none; padding:10px 20px; border-radius:5px;">View Event Details on Sloth Selfie</a></p>
            </div>
        `;
    } else if (notification.elementType === 'Activity') {
        subjectContent = `Friendly Reminder: The Activity ${element.title} Deadline is Approaching!`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4CAF50;">📅 Reminder: ${element.title}</h2>
                <p>Hey <strong>${receiver.username}</strong>,</p>
                <p>Your activity deadline is approaching! Here are the details:</p>
                <ul>
                    <li><strong>Deadline:</strong> ${element.deadline}</li>
                    <li><strong>Completed:</strong> ${element.completed ? 'Yes' : 'No'}</li>
                </ul>
                <p>Make sure to complete the activity on time! </p>
                <p><a href="http://localhost:3000" style="display:inline-block; background-color:#4CAF50; color:white; text-decoration:none; padding:10px 20px; border-radius:5px;">View Activity Details on Sloth Selfie</a></p>
            </div>
        `;
    }

    const mailOptions = {
        from: `"Sloth Selfie 🦥" <${process.env.EMAIL_USER}>`,
        to: receiver.email,
        subject: subjectContent,
        html: htmlContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
    });
}

const calculateNotificationTime = (notification) => {
    const notificationTime = new Date(notification.to);

    switch (notification.variant) {
        case 'day':
            notificationTime.setDate(notificationTime.getDate() - notification.before);
            break;
        case 'week':
            notificationTime.setDate(notificationTime.getDate() - (notification.before * 7));
            break;
    }

    const [hours, minutes] = notification.time.split(':');
    notificationTime.setHours(hours, minutes, 0, 0);

    return notificationTime;
}

const getRepeatInterval = (notification) => {
    const value = notification.before || 1;

    switch (notification.variant) {
        case 'minute':
            return value * 60 * 1000;
        case 'hour':
            return value * 60 * 60 * 1000;
        case 'day':
            return value * 24 * 60 * 60 * 1000;
        case 'week':
            return value * 7 * 24 * 60 * 60 * 1000;
        default:
            return 24 * 60 * 60 * 1000;
    }
}

const getTriggerAt = (notification, now) => {
    let triggerAt = null;
    if (notification.type === 'repeat') {
        const start = new Date(notification.from);
        const interval = getRepeatInterval(notification);
        const timeSinceStart = now - start;
        const intervalsPassed = Math.floor(timeSinceStart / interval);
        const nextTrigger = new Date(start.getTime() + (intervalsPassed + 1) * interval);
        triggerAt = nextTrigger;
    } else if (notification.type === 'default') {
        triggerAt = calculateNotificationTime(notification);
    }

    return triggerAt;
}

const getUrgencyFrequency = (deadline, now) => {
    const elapsedMs = now.getTime() - new Date(deadline).getTime();

    const hour = 60 * 60 * 1000;
    const day = 24 * hour;

    if (elapsedMs < day) return day;
    else if (elapsedMs < 2 * day) return 6 * hour;
    else return hour;
};

const checkUrgency = (lastSentAt, deadline, now) => {
    const freqMs = getUrgencyFrequency(deadline, now);

    if (now.getTime() < lastSentAt.getTime()) {
        return now.getTime() - new Date(deadline).getTime() >= freqMs;
    }

    return now.getTime() - lastSentAt.getTime() >= freqMs;
};

module.exports = {
    sendSystemNotification,
    sendEmailNotification,
    calculateNotificationTime,
    getRepeatInterval,
    getTriggerAt,
    checkUrgency
};