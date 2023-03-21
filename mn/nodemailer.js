const nodemailer = require('nodemailer');


const sendVerifyEmail = async (userEmail, otp) => {

    const mailTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
       
        auth: {
            user:'unknownow41@gmail.com' ,
            pass: 'yeacdulpkgoqsymx'
        }
    })
   console.log(userEmail);
   console.log("hoiii");
    const message = {
        from: "G ONE ",
        to: userEmail,
        subject: "Email Verification OTP",
        text: `Your OTP code is ${otp}. Please enter this code to verify your email address.`,
        html: `<p>Your OTP code is <strong>${otp}</strong>. Please enter this code to verify your email address.</p>`
    }
    console.log(otp);

    const info = await mailTransporter.sendMail(message, (err) => {
        if (err) {
            console.log("Sending email failed", err);
        } else {
            console.log("Email sent successfully", info.messageId);
        }
    })

}

module.exports = { sendVerifyEmail };