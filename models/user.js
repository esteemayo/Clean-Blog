const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: 6
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        minlength: 6,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwordsdo not match'
        }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    passwordChangedAt: Date
});

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = resetToken;

    console.log({ resetToken }, this.resetPasswordToken);

    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 1 Hour

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;