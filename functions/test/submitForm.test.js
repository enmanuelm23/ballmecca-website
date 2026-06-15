const { validate } = require('../index');

describe('submitForm.validate', () => {
  test('valid contact passes', () => {
    expect(validate({ formType:'contact', email:'a@b.com', name:'A', message:'Hi' }))
      .toMatchObject({ ok:true, collection:'contactMessages' });
  });
  test('valid earlyAccess passes with just email', () => {
    expect(validate({ formType:'earlyAccess', email:'a@b.com' }))
      .toMatchObject({ ok:true, collection:'earlyAccessSignups' });
  });
  test('unknown formType rejected', () => {
    expect(validate({ formType:'hack', email:'a@b.com' }).ok).toBe(false);
  });
  test('bad email rejected', () => {
    expect(validate({ formType:'earlyAccess', email:'nope' }).errors).toContain('email');
  });
  test('contact without message rejected', () => {
    expect(validate({ formType:'contact', email:'a@b.com', name:'A' }).errors).toContain('message');
  });
  test('honeypot flagged as spam', () => {
    expect(validate({ formType:'earlyAccess', email:'a@b.com', company_website:'x' }).errors).toContain('spam');
  });
});
