const Notification = require('../models/notificationModel');
const Event = require('../models/eventModel');
const Activity = require('../models/activityModel');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const webPush = require('web-push');
const nodemailer = require('nodemailer');
const { getIO } = require('../socket/socket');
const { getEventProgrammedEmail, getActivityProgrammedEmail, getElementInvitationEmail, getElementModificationEmail } = require('../utils/emailTemplates');

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

    const payload = {
        title: element.title,
        body: notification.text,
        notificationId: notification.id,
        elementId: notification.element,
        elementType: notification.elementType,
        //url: 'http://localhost:3000',
        url: 'https://site232453.tw.cs.unibo.it',
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

        webPush.sendNotification(subscription.subscription, pushPayload)
            .then(() => console.log('Notification sent'))
            .catch(error => console.error('Error sending notification:', error));
    });
}

const sendEmailNotification = async (notification, invitation, modification) => {
    console.log('Sending email notification:', notification);

    const receiver = await User.findById(notification.user);
    if (!receiver) {
        console.error('Receiver not found:', notification.user);
        return;
    }

    let element;
    if (notification.elementType === 'Activity') element = await Activity.findById(notification.element);
    else if (notification.elementType === 'Event') element = await Event.findById(notification.element);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    let subjectContent, htmlContent;

    if (invitation) {
        ({ subjectContent, htmlContent } = getElementInvitationEmail(element, notification.elementType, receiver));
    } else if (modification) {
        ({ subjectContent, htmlContent } = getElementModificationEmail(element, notification.elementType));
    } else if (notification.elementType === 'Event') {
        ({ subjectContent, htmlContent } = getEventProgrammedEmail(element, receiver));
    } else if (notification.elementType === 'Activity') {
        ({ subjectContent, htmlContent } = getActivityProgrammedEmail(element, receiver));
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