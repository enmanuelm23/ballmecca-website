const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
admin.initializeApp();

const ALLOWED_ORIGIN = 'https://ballmecca.com';
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

const submitForm = onRequest({ cors: ALLOWED_ORIGIN, region: 'us-central1' }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const body = req.body && Object.keys(req.body).length ? req.body : Object.fromEntries(new URLSearchParams(req.rawBody?.toString() || ''));
  const result = validate(body);
  if (!result.ok) return res.status(result.errors.includes('spam') ? 200 : 400).json({ ok: result.errors.includes('spam') });
  try {
    await admin.firestore().collection(result.collection).add({
      email: body.email, name: body.name || null, subject: body.subject || null,
      message: body.message || null, createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'website',
    });
  } catch (err) {
    console.error('submitForm: Firestore write failed', err);
    return res.status(500).json({ ok: false });
  }
  // Email notification is wired in the implementation (e.g. via an extension or nodemailer) per §12.
  return res.status(200).json({ ok: true });
});

module.exports = { submitForm, validate };
