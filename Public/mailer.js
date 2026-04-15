const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourgmail@gmail.com',
    pass: 'your_app_password' // not your real password
  }
});

exports.sendMail = (to, subject, text) => {
  return transporter.sendMail({
    from: '"Finance System" <yourgmail@gmail.com>',
    to,
    subject,
    text
  });
};
