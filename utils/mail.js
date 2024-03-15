const nodemailer = require("nodemailer");

const sendMail = async (option) => {
 try {
  
   const transporter = nodemailer.createTransport({
     host: process.env.host,
     port: process.env.PORT,

     auth: {
       user: process.env.user_mail,
       pass: process.env.user_password,
     },
   });
   const mailOption = {
     from: process.env.user_mail,
     to: option.email,
     subject: option.subject,
     text: option.message,
   };
   await transporter.sendMail(mailOption);
   transporter.verify(function (error, success) {
     if (error) {
       console.log(error);
     } else {
       console.log("Mail is Send to " + option.email);
     }
   });
 } catch (error) {
  console.log(error.message)
 }
};

module.exports = sendMail;
