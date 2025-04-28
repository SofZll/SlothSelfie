const validateLogin = (username, password) => {
    if (!username || !password) return false;

    return true;
}

const validateRegistration = (name, username, email, password) => {
    if (!name || !username || !email || !password) return false;

    return true;
}

const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

const validatePhoneNumber = (phoneNumber) => {
    const phonePattern = /^\+?(\d{1,3})?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/;
    return phonePattern.test(phoneNumber);
}

const validateNotification = (notif, n) => {
    switch (n) {
        case 1:
            return notif.type === 'default' && notif.before && notif.variant && notif.time;
        case 2:
            return notif.type === 'repeat' && notif.before && notif.variant && notif.fromDate && notif.fromTime;
        case 3: 
            return notif.mode.email || notif.mode.system;
        default:
            return false;
    }
};

export { validateLogin, validateRegistration, validateEmail, validatePhoneNumber, validateNotification };