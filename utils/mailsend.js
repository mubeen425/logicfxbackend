// const { SMTPClient, Message } = require("emailjs");
const config = require("config");
const mail = require("nodemailer");
const trans = mail.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
    user: "sulaimanfarooqi526@gmail.com",
    pass: "idnuspckmcftqlxa",
  },
});

function send(to, subject, text, verifyToken) {
  var mailOptions = {
    from: "sulaimanfarooqi526@gmail.com",
    to: to,
    subject: subject,
    // text: text,
    html: `
<div style=\" width:100%;height:100%; text-align:center;\">
<p>Please Verify Your Email by clicking the button below.</p></br>
<img src=\"https://mkdesigno.com/wp-content/uploads/2019/10/verify_email.png\" alt="logo" style=\" width:300px;height:300px; text-align:center;\"/></br>
<a style=\" max-width:200px; height:45px; padding:10px; border-radius:5px; border:1px solid white; color:white;background:blue;\" href=\"${config.get(
      "baseurl"
    )}/api/user/verify/${verifyToken}\">Verify Email</a>
</div>`,
  };
  trans.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
  });
}

// function send(to, subject, text, verifyToken) {
//   const client = new SMTPClient({
//     user: "sulaimanfarooqi526@gmail.com",
//     password: "qypecazbmmwcquef",
//     host: "smtp-mail.outlook.com",
//     tls: {
//       ciphers: "SSLv3",
//     },
//   });

//   const message = new Message({
//     text: "i hope this works",
//     from: "sulaimanfarooqi526@gmail.com",
//     to: to,
//     cc: "sulaimanfarooqi526@gmail.com",
//     subject: subject,
//     attachment: [
//       {
//         data: `<html><div style=\" width:100%;height:100%; text-align:center;\">
//       <p>Please Verify Your Email by clicking the button below.</p></br>
//       <img src=\"https://mkdesigno.com/wp-content/uploads/2019/10/verify_email.png\" alt="logo" style=\" width:300px;height:300px; text-align:center;\"/></br>
//       <a style=\" max-width:200px; height:45px; padding:10px; border-radius:5px; border:1px solid white; color:white;background:blue;\" href=\"${config.get(
//         "baseurl"
//       )}/api/user/verify/${verifyToken}\">Verify Email</a>
//       </div></html>`,
//         alternative: true,
//       },
//     ],
//   });

//   client.send(message, function (err, message) {
//     console.log(err || message);
//   });
// }

module.exports = send;
