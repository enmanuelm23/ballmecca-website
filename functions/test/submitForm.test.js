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
  test('contact without name rejected', () => {
    expect(validate({ formType:'contact', email:'a@b.com', message:'Hi' }).errors).toContain('name');
  });
  test('whitespace-only name rejected (trim guard)', () => {
    expect(validate({ formType:'contact', email:'a@b.com', name:'   ', message:'Hi' }).errors).toContain('name');
  });
  test('null/garbage body rejected without throwing', () => {
    expect(validate(null).ok).toBe(false);
    expect(validate(undefined).ok).toBe(false);
  });
  test('honeypot flagged as spam', () => {
    expect(validate({ formType:'earlyAccess', email:'a@b.com', company_website:'x' }).errors).toContain('spam');
  });
});
