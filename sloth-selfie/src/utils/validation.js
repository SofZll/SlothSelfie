const validateLogin = (username, password) => {
    if (!username || !password) {
        return false;
    }
    return true;
}

const validateRegister = (name, username, email, password) => {
    if (!name || !username || !email || !password) {
        return false;
    }
    return true;
}

export { validateLogin, validateRegister };