const calculateDate = (date, minusTime) => {
    const newDate = new Date(date);
    switch (minusTime) {
        case '0':
            newDate.setHours(0, 8, 0, 0);
            break;
        case '60':
            newDate.setHours(newDate.getHours() - 1);
            break;
        case '120':
            newDate.setHours(newDate.getHours() - 2);
            break;
        case '1440':
            newDate.setDate(newDate.getDate() - 1);
            newDate.setHours(0, 8, 0, 0);
            break;
    }
    return date;
};

module.exports = { calculateDate };