const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const ejs = require('ejs');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.username = user.firstName;
        this.url = url;
        this.from = `Admin <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        // Mailtrap
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Send the actual email
    async send(template, subject) {
        // Render HTML based on a pug template
        const html = ejs.renderFile(`${__dirname}/../views/email/${template}.jade`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        // Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to NodeBlog');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)');
    }
};