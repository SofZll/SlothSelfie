const Notification = require('../models/notificationModel');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const webPush = require('web-push');
const { getIO } = require('../socket/socket');

const sendSystemNotification = async (notification) => {
    // internal notification
    const io = getIO();
    const user = await User.findById(notification.user._id);
    if (!user) {
        console.error('User not found:', notification.user._id);
        return;
    }

    let body = '';
    if (notification.type != 'now') {
        body = `il tuo ${notification.elementType} "${notification.element.title}" scade il ${new Date(notification.to).toLocaleString()}`;
    } else {
        body = `il tuo ${notification.elementType} "${notification.element.title}" è stato modificato`;
    }

    const payload = {
        title: notification.element.title,
        body,
        notificationId: notification.id,
        url: 'http://localhost:3000',
    };

    console.log('user:', user);
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

    if (notification.type === 'default') {
        await Notification.findByIdAndUpdate(notification._id, { status: 'inactive' });
    }
}

const sendEmailNotification = async (notification) => {
    console.log('Sending email notification:', notification);

    const receiver = await User.findById(notification.user);
    if (!receiver) {
        console.error('Receiver not found:', notification.user);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    let subjectContent, htmlContent;

    if (notification.elementType === 'Event') {
        subjectContent = `Friendly Reminder: The Event ${notification.element.title} is Coming Up!`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4CAF50;">📅 Reminder: ${notification.element.title}</h2>
                <p>Hey <strong>${receiver.username}</strong>,</p>
                <p>Your event is coming up soon! Here are the details:</p>
                <ul>
                    <li><strong>Date:</strong> ${notification.element.date}</li>
                    <li><strong>Time:</strong> ${notification.element.time}</li>
                    <li><strong>Location:</strong> ${notification.element.eventLocation}</li>
                </ul>
                <p>Make sure to be there! </p>
                <p><a href="http://localhost:3000" style="display:inline-block; background-color:#4CAF50; color:white; text-decoration:none; padding:10px 20px; border-radius:5px;">View Event Details on Sloth Selfie</a></p>
            </div>
        `;
    } else if (notification.elementType === 'Activity') {
        subjectContent = `Friendly Reminder: The Activity ${notification.element.title} Deadline is Approaching!`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4CAF50;">📅 Reminder: ${notification.element.title}</h2>
                <p>Hey <strong>${receiver.username}</strong>,</p>
                <p>Your activity deadline is approaching! Here are the details:</p>
                <ul>
                    <li><strong>Deadline:</strong> ${notification.element.deadline}</li>
                    <li><strong>Completed:</strong> ${notification.element.completed ? 'Yes' : 'No'}</li>
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

    if (notification.type === 'default') {
        await Notification.findByIdAndUpdate(notification._id, { status: 'inactive' });
    }
}

module.exports = {
    sendSystemNotification,
    sendEmailNotification,
};