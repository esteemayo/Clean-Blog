const md5 = require('md5');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const randomstring = require('randomstring');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please tell us your username'],
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        minlength: 8,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: false
    },
    verifyToken: {
        type: String,
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    passwordChangedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('gravatar').get(function() {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
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

userSchema.methods.createEmailVerificationToken = function () {
    return this.verifyToken = randomstring.generate();
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.resetPasswordToken);

    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour from now

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;