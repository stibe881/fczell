const nodemailer = require('nodemailer');
const db = require('./db');

let cachedTransporter = null;
let cachedSmtpConfig = null;

// --- Email HTML Template ---
function emailTemplate(content, footerText) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f5f7; padding: 24px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="background: #1a80b6; padding: 20px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">FC Zell</td>
              <td style="text-align: right; color: rgba(255,255,255,0.7); font-size: 13px;">fczell.ch</td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Content -->
      <tr>
        <td style="padding: 32px; color: #1e293b; font-size: 15px; line-height: 1.65;">
          ${content}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
          ${footerText || 'FC Zell &middot; Sportplatz Zell &middot; fczell.ch'}
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function detailsTable(details) {
  let rows = '';
  for (const [key, val] of Object.entries(details)) {
    rows += `<tr>
      <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 14px; white-space: nowrap; vertical-align: top;">${key}</td>
      <td style="padding: 6px 0; font-size: 14px; color: #1e293b;">${val}</td>
    </tr>`;
  }
  return `<table cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">${rows}</table>`;
}

// --- SMTP ---
async function getSmtpConfig() {
  try {
    const [rows] = await db.query('SELECT * FROM smtp_settings WHERE id = 1');
    if (rows.length > 0) return rows[0];
  } catch (e) {
    console.error('Error loading SMTP settings:', e);
  }
  return { host: '', port: 587, secure: 0, username: '', password: '', from_name: 'FC Zell', from_email: 'info@fczell.ch' };
}

async function getTransporter() {
  const config = await getSmtpConfig();
  const configKey = JSON.stringify({ host: config.host, port: config.port, username: config.username, password: config.password });
  if (cachedTransporter && cachedSmtpConfig === configKey) {
    return { transporter: cachedTransporter, config };
  }
  if (!config.host) {
    console.warn('SMTP not configured – no emails will be sent.');
    return { transporter: null, config };
  }
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure === 1,
    auth: { user: config.username, pass: config.password }
  });
  cachedSmtpConfig = configKey;
  return { transporter: cachedTransporter, config };
}

function resetTransporterCache() {
  cachedTransporter = null;
  cachedSmtpConfig = null;
}

async function getRecipients(formKey) {
  try {
    const [rows] = await db.query('SELECT recipients FROM email_settings WHERE form_key = ?', [formKey]);
    if (rows.length > 0 && rows[0].recipients) return rows[0].recipients;
  } catch (e) {
    console.error('Error loading email recipients for', formKey, e);
  }
  return 'info@fczell.ch';
}

// --- Contact Email ---
async function sendContactEmail(data) {
  const { subject, name, email, phone, message, extraFields } = data;
  const { transporter, config } = await getTransporter();
  if (!transporter) return false;

  let formKey = 'kontakt_allgemein';
  if (subject === 'Adressänderung') formKey = 'kontakt_adressaenderung';
  else if (subject === 'Clubhausbuchung') formKey = 'kontakt_clubhausbuchung';

  const recipients = await getRecipients(formKey);

  // Build extra fields HTML
  let extraHtml = '';
  if (extraFields) {
    for (const [key, val] of Object.entries(extraFields)) {
      if (val) extraHtml += `<strong>${key}:</strong> ${val}<br>`;
    }
  }

  const adminHtml = emailTemplate(`
    <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">Neue Kontaktanfrage</p>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">${subject}</p>
    ${detailsTable({ 'Name': name, 'E-Mail': email, 'Telefon': phone || '–' })}
    ${extraHtml ? '<div style="margin-bottom: 16px;">' + extraHtml + '</div>' : ''}
    <div style="background: #f8fafc; border-left: 3px solid #1a80b6; padding: 14px 18px; border-radius: 4px; margin-top: 8px;">
      <p style="margin: 0; color: #475569; font-size: 14px; white-space: pre-wrap;">${message}</p>
    </div>
  `, `Du kannst direkt auf diese E-Mail antworten, um ${name} zu kontaktieren.`);

  try {
    await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to: recipients,
      replyTo: email,
      subject: `Kontaktanfrage: ${subject}`,
      html: adminHtml,
      text: `Neue Kontaktanfrage\n\n${subject}\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone || '–'}\n\nNachricht:\n${message}`
    });
    console.log('Contact email sent to:', recipients);
    return true;
  } catch (err) {
    console.error('Error sending contact email:', err);
    return false;
  }
}

// --- Registration Confirmation ---
async function sendRegistrationConfirmation(data) {
  const { to, type, name, details } = data;
  const { transporter, config } = await getTransporter();
  if (!transporter) return false;

  let formKey = 'anmeldung_standard';
  if (type === 'juniorenlager') formKey = 'anmeldung_juniorenlager';
  else if (type === 'dorfturnier') formKey = 'anmeldung_dorfturnier';
  else if (type === 'matchballspende') formKey = 'matchballspende';

  const adminRecipients = await getRecipients(formKey);
  const fromAddr = `"${config.from_name}" <${config.from_email}>`;

  // Friendly type names
  const typeNames = {
    'juniorenlager': 'Juniorenlager',
    'dorfturnier': 'Dorfturnier',
    'matchballspende': 'Matchballspende',
    'standard': 'Anlass'
  };
  const typeName = typeNames[type] || type;

  // 1. Confirmation to the person
  const confirmHtml = emailTemplate(`
    <p style="margin: 0 0 16px;">Hallo ${name},</p>
    <p style="margin: 0 0 20px;">Deine Anmeldung für <strong>${typeName}</strong> ist bei uns eingegangen. Hier deine Angaben zur Übersicht:</p>
    ${detailsTable(details)}
    <p style="margin: 20px 0 0;">Bei Fragen melde dich gerne bei uns.</p>
    <p style="margin: 16px 0 0;">Sportliche Grüsse,<br>FC Zell</p>
  `);

  const confirmText = `Hallo ${name},\n\nDeine Anmeldung für ${typeName} ist bei uns eingegangen.\n\n${Object.entries(details).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nBei Fragen melde dich gerne bei uns.\n\nSportliche Grüsse,\nFC Zell`;

  // 2. Admin notification
  const adminHtml = emailTemplate(`
    <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600;">Neue Anmeldung</p>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">${typeName}</p>
    ${detailsTable(details)}
  `, `Du kannst direkt auf diese E-Mail antworten, um die Person zu kontaktieren.`);

  const adminText = `Neue Anmeldung: ${typeName}\n\n${Object.entries(details).map(([k, v]) => `${k}: ${v}`).join('\n')}`;

  try {
    await transporter.sendMail({
      from: fromAddr, to: to,
      subject: `Anmeldebestätigung – ${typeName}`,
      html: confirmHtml, text: confirmText
    });
    console.log('Confirmation sent to:', to);

    await transporter.sendMail({
      from: fromAddr, to: adminRecipients, replyTo: to,
      subject: `Neue Anmeldung: ${typeName}`,
      html: adminHtml, text: adminText
    });
    console.log('Admin notification sent to:', adminRecipients);
    return true;
  } catch (err) {
    console.error('Error sending registration email:', err);
    return false;
  }
}

module.exports = {
  sendContactEmail,
  sendRegistrationConfirmation,
  getRecipients,
  resetTransporterCache
};
