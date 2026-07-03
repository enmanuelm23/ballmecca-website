import { describe, it, expect, vi, beforeEach } from 'vitest';
import { send } from '../src/lib/analytics';

// Intent: the ConsentBanner sets window.__bmConsent; send() must ONLY forward
// events to gtag when consent is explicitly 'granted' (no consent / denied → no tracking).
describe('analytics send() consent gate', () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>).__bmConsent = undefined;
    (window as unknown as Record<string, unknown>).gtag = undefined;
    (window as unknown as Record<string, unknown>).dataLayer = [];
  });

  it('does NOT track before a consent decision', () => {
    const gtag = vi.fn();
    (window as unknown as Record<string, unknown>).gtag = gtag;
    send('lesson_purchased', { value: '10' });
    expect(gtag).not.toHaveBeenCalled(); // kills mutation: removing the consent guard
  });

  it('does NOT track when consent is denied', () => {
    const gtag = vi.fn();
    (window as unknown as Record<string, unknown>).gtag = gtag;
    (window as unknown as Record<string, unknown>).__bmConsent = 'denied';
    send('lesson_purchased');
    expect(gtag).not.toHaveBeenCalled();
  });

  it('forwards the event to gtag when consent is granted', () => {
    const gtag = vi.fn();
    (window as unknown as Record<string, unknown>).gtag = gtag;
    (window as unknown as Record<string, unknown>).__bmConsent = 'granted';
    send('lesson_purchased', { value: '10' });
    expect(gtag).toHaveBeenCalledWith('event', 'lesson_purchased', { value: '10' });
  });
});
