const nodemailer = require('nodemailer');
const mailSender = async (userInfo) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailInformation =  {
        from: 'RK MART Support<support@rkmart.com>',
        to:userInfo.mail,
        subject: userInfo.subject,
        text: userInfo.message
    }

    await transporter.sendMail(mailInformation);
}

module.exports = { mailSender }