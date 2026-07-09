export function send(event: string, params: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  if (import.meta.env.DEV) console.debug('[analytics]', event, params);
  // Consent Mode v2 governs whether this hit uses cookies (via gtag's consent
  // state), so we always forward the event to gtag — which is bootstrapped in the
  // document head. No consent yet → the tag sends it as a cookieless ping.
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') w.gtag('event', event, params);
}

let delegated = false;
export function initDelegation() {
  if (delegated) return; // call-once guard: avoid duplicate listeners / double-fired events
  delegated = true;
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement)?.closest('[data-event]') as HTMLElement | null;
    if (!el) return;
    const { event, ...rest } = el.dataset as Record<string, string>;
    if (event) send(event, rest);
  });
}
