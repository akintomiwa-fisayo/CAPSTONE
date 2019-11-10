exports.isEmpty = (str = '') => (!str.trim());
exports.isEmail = (str) => (!((/[a-z0-9]+@+[a-z0-9]+.[a-z]{3,}/i.test(str) === false || /[^a-z0-9.@]/i.test(str) === true)));
