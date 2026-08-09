const nodemailer = require('nodemailer');
const config = require('../config');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
      user: config.smtp.email,
      pass: config.smtp.password,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  await transporter.sendMail({
    from: `${config.email.fromName} <${config.email.from}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
