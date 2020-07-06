const User = require('../models/User');
const factory = require('../controller/handlerFactory');

exports.createUser = (req, res, next) => {
    res.status(500).json({
        status: 'error',
        message: ``
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);