import mailer from 'nodemailer';

export const sendMail = async (to: string, subject: string, body: string) => {
  const transport = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: to,
    subject: subject,
    text: body
  };

  return await transport.sendMail(mailOptions);
};
