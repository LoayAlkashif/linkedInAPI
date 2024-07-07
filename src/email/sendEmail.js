import nodemailer from "nodemailer";
export const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "loayalkashif@gmail.com",
      pass: "ieyutugojhynsqob",
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"A5ook loay 😁" <loayalkashif@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "LinkedIn",
    text: `Your OTP code is ${otp}. It will expire in 3 minutes.`,
  });

  console.log("Message sent: %s", info.messageId);
};
