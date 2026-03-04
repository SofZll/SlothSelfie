const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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

const combineDateTime = (date, time) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    const newDate = new Date(year, month - 1, day, hours, minutes);
    newDate.setHours(newDate.getHours() - 2);

    return newDate;
};

const findUserId = async (usernames) => {
    if (!usernames || usernames.length === 0) return [];

    const userIds = [];
    
    for (let i = 0; i < usernames.length; i++) {
        let user = await User.findOne({ username: usernames[i] });
        if (!user) console.log(`User ${usernames[i]} not found`);
        else userIds.push(user._id);
    }

    return userIds;
}

//Send a mail for export .ics files
const sendExportEmail = async (receiver, fileName, fileContent) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false, // Accetp not valid certificates also
        },
    });

    const mailOptions = {
        from: `"Sloth Selfie 🦥" <${process.env.EMAIL_USER}>`,
        to: receiver,
        subject: `Your exported file ${fileName}`,
        text: `Here is your exported file ${fileName}`,
        attachments: [
            {
                filename: fileName,
                content: fileContent,
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { calculateDate, combineDateTime, findUserId, sendExportEmail };