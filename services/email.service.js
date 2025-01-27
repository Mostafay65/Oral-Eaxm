const nodemailer = require("nodemailer");

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(to, subject, text, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }

    // Utility method for sending welcome emails
    async sendWelcomeEmail(userEmail, userName) {
        const subject = "Ipass Oral Exam Platform";
        const text = `Welcome ${userName}! Thank you for joining our Ipass Oral Exam Platform.`;
        const html = `
            <h1>Welcome to Oral Exam Platform</h1>
            <p>Dear ${userName},</p>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            <p>Best regards,<br>The Oral Exam Team</p>
        `;

        return this.sendEmail(userEmail, subject, text, html);
    }

    // Utility method for sending exam notifications
    async sendExamNotification(userEmail, userName, examDetails) {
        const subject = "New Oral Exam Scheduled";
        const text = `Hello ${userName}, you have a new oral exam scheduled: ${examDetails.title}`;
        const html = `
            <h1>New Oral Exam Scheduled</h1>
            <p>Dear ${userName},</p>
            <p>You have a new oral exam scheduled:</p>
            <ul>
                <li>Title: ${examDetails.title}</li>
                <li>Start Time: ${new Date(examDetails.startDate).toLocaleString()}</li>
                <li>End Time: ${new Date(examDetails.endDate).toLocaleString()}</li>
                <li>Duration: ${examDetails.duration} minutes</li>
            </ul>
            <p>Please make sure to be prepared and check your equipment before the exam.</p>
            <p>Best regards,<br>The Oral Exam Team</p>
        `;

        return this.sendEmail(userEmail, subject, text, html);
    }

    // sent email to notify students of their grade after their answer is evaluated in the answer processing queue;
    async sendGradeEmail(userEmail, userName, examDetails, grade, examGrade) {
        const subject = "Ipass Oral Exam Grade";
        const text = `Hello ${userName}, your oral exam grade for ${examDetails.title} is: ${grade}`;
        const html = `
            <h1>Oral Exam Grade</h1>
            <p>Dear ${userName},</p>
            <p>Your oral exam grade for ${examDetails.title} is: ${grade} / ${examDetails.degree}</p>
            <p>Best regards,<br>The Ipass Oral Exam Team</p>
        `;
        return this.sendEmail(userEmail, subject, text, html);
    }

    // notify instructors after the exam is ready
    async sendExamReadyEmail(userEmail, userName, examDetails) {
        const subject = "Ipass Oral Exam is Ready";
        const text = `Hello Dr ${userName}, your oral exam is ready for ${examDetails.title}`;
        const html = `
            <h1>Oral Exam is Ready</h1>
            <p>Dear Dr.${userName},</p>
            <p>Your oral exam is ready for ${examDetails.title}</p>
            <p>Best regards,<br>The Ipass Oral Exam Team</p>
        `;
        return this.sendEmail(userEmail, subject, text, html);
    }

    // notify students with their exam feedback
    async sendFeedbackEmail(userEmail, userName, examDetails, feedback) {
        const subject = "Ipass Oral Exam Feedback";
        const text = `Hello ${userName}, here's your feedback for ${examDetails.title} exam`;
        const html = `
            <h1>Oral Exam Feedback</h1>
            <p>Dear ${userName},</p>
            <p>Here's your feedback for ${examDetails.title} exam:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                ${feedback}
            </div>
            <p>Best regards,<br>The Ipass Oral Exam Team</p>
        `;
        return this.sendEmail(userEmail, subject, text, html);
    }
}

module.exports = new EmailService();
