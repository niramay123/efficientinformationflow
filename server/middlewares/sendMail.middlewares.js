import { createTransport } from "nodemailer";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


export const sendMail = async (email, subject, data) => {
  //smtp configuration
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // the mail format in html to send
  const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            h1 {
                color: red;
            }
            p {
                margin-bottom: 20px;
                color: #666;
            }
            .otp {
                font-size: 36px;
                color: #7b68ee; /* Purple text */
                margin-bottom: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>OTP Verification</h1>
            <p>Hello ${data.name} your (One-Time Password) for your account verification is.</p>
            <p class="otp">${data.otp}</p> 
        </div>
    </body>
    </html>
    `;

  await transport.sendMail({
    from: process.env.GMAIL,
    to: email,
    subject,
    html,
  });
};

export const sendForgotMail = async (subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #5a2d82;
    }
    p {
      color: #666666;
    }
    .button {
      display: inline-block;
      padding: 15px 25px;
      margin: 20px 0;
      background-color: #5a2d82;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
      text-align: center;
    }
    .footer a {
      color: #5a2d82;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>You have requested to reset your password. Please click the button below to reset your password.</p>
    <a href="${process.env.frontendurl}/reset-password/${data.token}" class="button">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <div class="footer">
      <p>Thank you,<br>Your Website Team</p>
      <p><a href="https://yourwebsite.com">yourwebsite.com</a></p>
    </div>
  </div>
</body>
</html>
`;

  await transport.sendMail({
    from: process.env.GMAIL,
    to: data.email,
    subject,
    html,
  });
};

export const resetPassword =async(req,res)=>{
  
  try {

    const decodedData = jwt.verify(req.query.token, process.env.FORGOT_SECRET);

    const user = await User.findOne({email:decodedData.email});

    if(!user) {
      res.status(400).json({message:"User doesn't exists"});
    };

    if(user.resetPasswordExpired === null) {
      return res.status(400).json({message:"Token expired"})
    }

    if(user.resetPasswordExpired < Date.now() ) {
      return res.status(400).json({message:"Token expired"})
    }

    const password = await bcrypt.hash(req.body.password, 10);

    user.password = password;
    user.resetPasswordExpired = null;

    await user.save();

    res.json({message:"Password reset Successfully"});
    
  } catch (error) {
    res.status(500).json({
      message:error.message,
    })
  }
}
