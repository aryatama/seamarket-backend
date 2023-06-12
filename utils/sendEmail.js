const nodemailer = require("nodemailer");

const sendEmail = async (from, to, subject, html, replyTo) => {
  //Create Email Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  //Option to sending email
  const options = {
    from,
    to,
    replyTo,
    subject,
    html,
  };

  //Send email
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
