import { describe, it, expect, vi, beforeEach } from 'vitest';
import { send } from '../src/lib/analytics';

// Intent (Google Consent Mode v2): consent is enforced at the tag level via gtag's
// consent state, NOT inside send(). So send() forwards every event to gtag when it's
// present (denied consent → the tag turns it into a cookieless ping), and safely
// no-ops when gtag isn't there (SSR / tag not yet ready).
describe('analytics send()', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>).gtag = undefined;
    (window as unknown as Record<string, unknown>).__bmConsent = undefined;
  });

  it('forwards the event to gtag with its name and params', () => {
    const gtag = vi.fn();
    (window as unknown as Record<string, unknown>).gtag = gtag;
    send('lesson_purchased', { value: '10' });
    // kills mutation: a hardcoded no-op, or passing the wrong event name/params
    expect(gtag).toHaveBeenCalledWith('event', 'lesson_purchased', { value: '10' });
  });

  it('does NOT gate on a consent flag (Consent Mode handles that at the tag)', () => {
    const gtag = vi.fn();
    (window as unknown as Record<string, unknown>).gtag = gtag;
    (window as unknown as Record<string, unknown>).__bmConsent = 'denied';
    send('page_view');
    // kills mutation: re-introducing an `if (__bmConsent !== 'granted') return` gate
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {});
  });

  it('safely no-ops when gtag is not present', () => {
    // kills mutation: removing the `typeof gtag === 'function'` guard (would throw)
    expect(() => send('page_view')).not.toThrow();
  });
});
