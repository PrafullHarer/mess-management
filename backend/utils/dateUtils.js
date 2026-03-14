const getISTDate = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

const getTodayStr = () => {
    const istDate = getISTDate();
    return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}`;
};

const getMonthPrefix = (date = getISTDate()) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

module.exports = { getISTDate, getTodayStr, getMonthPrefix };
