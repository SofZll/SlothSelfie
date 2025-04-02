const nodemailer = require('nodemailer');
const { getIO } = require('../socket/socket');
const { pushNotification } = require('../services/pushNotification');
const userSocketMap = require('../socket/userSocketMap');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
require('dotenv').config();

const calculateDate = (date, minusTime) => {
    const newDate = new Date(date);
    switch (minusTime) {
        case '0':
            newDate.setHours(0, 8, 0, 0);
            break;
        case '1440':
            newDate.setDate(newDate.getDate() - 1);
            newDate.setHours(0, 8, 0, 0);
            break;
        default:
            newDate.setMinutes(newDate.getMinutes() - parseInt(minusTime));
            break;
    }
    return newDate;
};

/**
 * La funzione per inviare la notifica, al momento viene chiamata solo dal job di Agenda
 * @param {*} notificationId identificativo della notifica
 */
const emitNotification = async (notificationId) => {
    const io = getIO();
    if (!io) {
        console.error("Socket.IO instance not found.");
        return;
    }

    const notification = await Notification.findById(notificationId).populate('element');

    const receiversUsername = await Promise.all(notification.receivers.map(async receiver => {
        const user = await User.findById(receiver);
        return user.username;
    }));

    // FIX: le notifiche da dispositivo arrivano solo quando l'utente è connesso
    receiversUsername.forEach(receiver => {
        if (notification.type.includes('OS')) {
            console.log('userSocketMap:', userSocketMap);
            const receiverSocketIds = userSocketMap[receiver]; // se l'utente ha più dispositivi connessi
            if (receiverSocketIds && receiverSocketIds.length > 0) {
                console.log(`Sending notification to ${receiver}: ${notification.message}`);
                receiverSocketIds.forEach(receiverSocketId => {
                    io.to(receiverSocketId).emit('notification', {
                        title: 'New notification',
                        sender: { username: notification.sender },
                        body: notification.message,
                    });
                });
            } else {
                pushNotification(notification.sender, receiver, notification.message);
            }
        }
        if (notification.type.includes('email')) {
            sendEmail(receiver, notification.toObject());
            console.log(`Sending email notification to ${receiver}: ${notification.message}`);
        }
    });
};

/**
 * Funzione per inviare email
 */
// TODO: cambiare colore della mail in base all'urgenza
const sendEmail = async (receiver, notification) => {

    console.log("receiver:", receiver);
    console.log("notification:", notification);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const receiverUser = await User.findOne({ username: receiver });

    let subjectContent, htmlContent;

    if (notification.elementType === 'Event') {
        subjectContent = `Friendly Reminder: The Event ${notification.element.title} is Coming Up!`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4CAF50;">📅 Reminder: ${notification.element.title}</h2>
                <p>Hey <strong>${receiverUser.username}</strong>,</p>
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
                <p>Hey <strong>${receiverUser.username}</strong>,</p>
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
        to: receiverUser.email,
        subject: subjectContent,
        html: htmlContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const findUserId = async (usernames) => {
    if (!usernames || usernames.length === 0) return [];

    const userIds = [];
    
    for (let i = 0; i < usernames.length; i++) {
        let user = await User.findOne({ username: usernames[i] });
        if (!user) {
            throw new Error(`User ${usernames[i]} not found`);
        }

        userIds.push(user._id);
    }

    return userIds;
}

module.exports = { calculateDate, emitNotification, findUserId };