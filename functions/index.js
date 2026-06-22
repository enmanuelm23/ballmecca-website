const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
admin.initializeApp();

const ALLOWED_ORIGIN = 'https://ballmecca.com';
const NOTIFY_TO = 'support@ballmecca.com';
const TYPES = { contact: 'contactMessages', earlyAccess: 'earlyAccessSignups' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pure validator — unit-tested in test/submitForm.test.js
function validate(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['body'], collection: undefined };
  }
  const errors = [];
  const formType = String(body.formType || '');
  if (!TYPES[formType]) errors.push('formType');
  if (body.company_website) errors.push('spam'); // honeypot must be empty
  if (!EMAIL_RE.test(String(body.email || ''))) errors.push('email');
  if (formType === 'contact') {
    if (!String(body.name || '').trim()) errors.push('name');
    if (!String(body.message || '').trim()) errors.push('message');
  }
  return { ok: errors.length === 0, errors, collection: TYPES[formType] };
}

// Escape user-supplied values before embedding in the notification email HTML.
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Build a "mail" doc for the Trigger Email extension (firestore-send-email),
// which watches the `mail` collection and sends to/message.{subject,text,html}.
function buildMail(formType, body) {
  const email = String(body.email || '');
  if (formType === 'contact') {
    const subject = `New contact form: ${String(body.subject || 'General')}`;
    const lines = [`Name: ${body.name || ''}`, `Email: ${email}`, `Subject: ${body.subject || 'General'}`, '', String(body.message || '')];
    return {
      to: [NOTIFY_TO], replyTo: email,
      message: {
        subject,
        text: lines.join('\n'),
        html: `<h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${esc(body.name)}</p>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>Subject:</strong> ${esc(body.subject || 'General')}</p>
          <p><strong>Message:</strong></p>
          <p>${esc(body.message).replace(/\n/g, '<br>')}</p>`,
      },
    };
  }
  return {
    to: [NOTIFY_TO], replyTo: email,
    message: {
      subject: 'New early-access signup',
      text: `New recruiter early-access signup: ${email}`,
      html: `<h2>New early-access signup</h2><p><strong>Email:</strong> ${esc(email)}</p>`,
    },
  };
}

const submitForm = onRequest({ cors: ALLOWED_ORIGIN, region: 'us-central1' }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const body = req.body && Object.keys(req.body).length ? req.body : Object.fromEntries(new URLSearchParams(req.rawBody?.toString() || ''));
  const result = validate(body);
  if (!result.ok) return res.status(result.errors.includes('spam') ? 200 : 400).json({ ok: result.errors.includes('spam') });
  const db = admin.firestore();
  // Source of truth: store the submission. A failure here is a real error.
  try {
    await db.collection(result.collection).add({
      email: body.email, name: body.name || null, subject: body.subject || null,
      message: body.message || null, createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'website',
    });
  } catch (err) {
    console.error('submitForm: Firestore write failed', err);
    return res.status(500).json({ ok: false });
  }
  // Best-effort email notification via the Trigger Email extension (watches `mail`).
  // A failure here must NOT lose the submission or surface an error to the user.
  try {
    await db.collection('mail').add(buildMail(String(body.formType || ''), body));
  } catch (err) {
    console.error('submitForm: mail enqueue failed', err);
  }
  return res.status(200).json({ ok: true });
});

module.exports = { submitForm, validate, buildMail };
