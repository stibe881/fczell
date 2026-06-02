const nodemailer = require('nodemailer');

// Dummy transport for now since the original was lost.
// In a real environment, configure host, port, auth.
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'windows'
});

async function sendContactEmail(data) {
  const { subject, name, email, phone, message, extraFields } = data;
  try {
    const info = await transporter.sendMail({
      from: '"FC Zell" <info@fczell.ch>',
      to: 'info@fczell.ch', // Admin email
      subject: `Kontaktanfrage: ${subject}`,
      text: `Name: ${name}\nE-Mail: ${email}\nTelefon: ${phone}\nNachricht:\n${message}`
    });
    console.log('Mock email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Error sending contact email:', err);
    return false;
  }
}

async function sendRegistrationConfirmation(data) {
  const { to, type, name, details } = data;
  try {
    const info = await transporter.sendMail({
      from: '"FC Zell" <info@fczell.ch>',
      to: to,
      subject: `Anmeldebestätigung FC Zell (${type})`,
      text: `Hallo ${name},\n\nDeine Anmeldung wurde erfolgreich empfangen.\n\nDetails:\n${JSON.stringify(details, null, 2)}\n\nViele Grüsse,\nDein FC Zell Team`
    });
    console.log('Mock registration email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Error sending registration email:', err);
    return false;
  }
}

module.exports = {
  sendContactEmail,
  sendRegistrationConfirmation
};
