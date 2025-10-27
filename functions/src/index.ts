import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'qwabembongeni074@gmail.com',
    pass: 'lyjxurnppkltwcnb' // App password
  }
});

// Email templates
const generateEmailContent = (data: any) => {
  const { type, name = 'Member', queueType = 'consultation', position, newPosition = position, reason = '' } = data;

  switch (type) {
    case 'approval':
      return {
        subject: 'Consultation Request Approved - MMQ Tech',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h2>🙏 Consultation Request Approved</h2>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>We are pleased to inform you that your <strong>${queueType}</strong> consultation request has been approved!</p>
              <div style="background: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                <strong>Queue Details:</strong><br>
                • Position: <strong>#${position}</strong><br>
                • Type: <strong>${queueType.charAt(0).toUpperCase() + queueType.slice(1)}</strong><br>
                • Reason: <em>${reason}</em>
              </div>
              <p>You will receive automatic updates as your position in the queue changes.</p>
              <p><strong>Blessings,</strong><br>MMQ Tech Consultation Team</p>
            </div>
          </div>
        `
      };

    case 'decline':
      return {
        subject: 'Consultation Request Update - MMQ Tech',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h2>📋 Consultation Request Update</h2>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for your interest in scheduling a <strong>${queueType}</strong> consultation with us.</p>
              <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <strong>Request Status:</strong> We regret to inform you that your consultation request could not be approved at this time.<br><br>
                <strong>Reason:</strong> <em>${reason}</em>
              </div>
              <p>Please don't hesitate to submit another request when you feel ready.</p>
              <p><strong>Blessings,</strong><br>MMQ Tech Consultation Team</p>
            </div>
          </div>
        `
      };

    case 'position_update':
      return {
        subject: 'Queue Position Update - MMQ Tech',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h2>📍 Queue Position Update</h2>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Your position in the <strong>${queueType}</strong> consultation queue has been updated.</p>
              <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0; color: #0984e3;">Your Current Position</h3>
                <div style="font-size: 48px; font-weight: bold; color: #0984e3; margin: 10px 0;">#${newPosition}</div>
                <p style="margin: 0; color: #666;">in the ${queueType} queue</p>
              </div>
              <p>You're getting closer! We'll notify you again when your position changes.</p>
              <p><strong>Blessings,</strong><br>MMQ Tech Consultation Team</p>
            </div>
          </div>
        `
      };

    case 'your_turn':
      return {
        subject: 'Your Consultation is Ready - MMQ Tech',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h2>🔔 Your Consultation is Ready!</h2>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Dear <strong>${name}</strong>,</p>
              <div style="background: #00b894; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0;">It's Your Turn! 🙏</h3>
                <p style="margin: 0; font-size: 18px;">Your <strong>${queueType}</strong> consultation is ready to begin.</p>
              </div>
              <p>Please join the consultation session now. The spiritual leader is ready to meet with you.</p>
              <p><strong>Blessings,</strong><br>MMQ Tech Consultation Team</p>
            </div>
          </div>
        `
      };

    default:
      throw new Error('Unknown email type: ' + type);
  }
};

// Cloud Function to send emails
export const sendEmail = onRequest({cors: true}, async (req, res) => {
  try {
    logger.info("Sending email request:", req.body);

    const emailData = req.body;
    
    if (!emailData.to || !emailData.type) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, type' 
      });
      return;
    }

    const emailContent = generateEmailContent(emailData);

    const mailOptions = {
      from: 'MMQ Tech <qwabembongeni074@gmail.com>',
      to: emailData.to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info("Email sent successfully:", info.messageId);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    logger.error("Email sending failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});