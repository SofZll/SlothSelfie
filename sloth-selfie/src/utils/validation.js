const validateLogin = (username, password) => {
    if (!username || !password) {
        return false;
    }
    return true;
}

const validateRegistration = (name, username, email, password) => {
    if (!name || !username || !email || !password) {
        return false;
    }
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

export { validateLogin, validateRegistration, validateEmail, validatePhoneNumber };