import nodemailer from 'nodemailer';
import { text } from 'stream/consumers';
const EMAIL_PASS=process.env.EMAIL_PASS as string;
const EMAIL_USER=process.env.EMAIL_USER as string;

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string,text?: string) => {
    const mailOptions = {
        from: `HamroBagaicha <${EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
    };
    await transporter.sendMail(mailOptions);
}