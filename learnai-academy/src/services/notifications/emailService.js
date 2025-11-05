import nodemailer from "nodemailer";
export async function sendEmail({ to, subject, html }){
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM || "no-reply@learnai.local", to, subject, html });
}
