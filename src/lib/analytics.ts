export function send(event: string, params: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  if (import.meta.env.DEV) console.debug('[analytics]', event, params);
  // @ts-expect-error optional global
  window.dataLayer?.push({ event, ...params });
}

export function initDelegation() {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement)?.closest('[data-event]') as HTMLElement | null;
    if (!el) return;
    const { event, ...rest } = el.dataset as Record<string, string>;
    if (event) send(event, rest);
  });
}
