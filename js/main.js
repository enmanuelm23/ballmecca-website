// js/main.js

// ── Mobile nav ────────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// ── Active nav link ───────────────────────────────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (currentPath === '/' && href === 'index.html') ||
      (currentPath.includes('about') && href.includes('about')) ||
      (currentPath.includes('contact') && href.includes('contact')) ||
      (currentPath.includes('faq') && href.includes('faq'))) {
    link.classList.add('active');
  }
});

// ── Scroll reveal ─────────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Nav scroll style ──────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) {
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(10,14,26,0.98)';
    } else {
      nav.style.background = 'rgba(10,14,26,0.92)';
    }
  }
});

// ── Firebase top coaches (home page only) ─────────────────────────────────────
async function loadTopCoaches() {
  const container = document.getElementById('coaches-grid');
  if (!container) return;

  // Your Firebase config — replace with real values after flutterfire configure
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
  };

  try {
    // Dynamically load Firebase SDK
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
    const { getFirestore, collection, query, orderBy, limit, getDocs } =
      await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

    const app = initializeApp(firebaseConfig, 'ballmecca-web');
    const db = getFirestore(app);

    const q = query(
      collection(db, 'coachProfiles'),
      orderBy('rating', 'desc'),
      limit(5)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<p class="text-muted text-center" style="grid-column:1/-1;padding:48px 0;">
        Coaches coming soon — <a href="https://apps.apple.com/us/app/ballmecca/id1663498139"
        style="color:var(--cyan)">download the app</a> to be first.
      </p>`;
      return;
    }

    container.innerHTML = '';
    snap.forEach(doc => {
      const c = doc.data();
      const stars = '★'.repeat(Math.round(c.rating || 0)) + '☆'.repeat(5 - Math.round(c.rating || 0));
      const sport = (c.sports || []).join(', ') || 'Multi-sport';
      container.innerHTML += `
        <div class="coach-card reveal">
          <div class="coach-photo">
            ${c.photoUrl
              ? `<img src="${c.photoUrl}" alt="${c.displayName}" loading="lazy">`
              : `<div class="coach-placeholder">${(c.displayName || '?')[0]}</div>`}
          </div>
          <div class="coach-info">
            <div class="coach-sport">${sport}</div>
            <h3 class="coach-name">${c.displayName || 'Coach'}</h3>
            ${c.rating > 0 ? `<div class="coach-stars">${stars} <span>${c.rating.toFixed(1)}</span></div>` : ''}
            ${c.location ? `<div class="coach-location">📍 ${c.location}</div>` : ''}
            <a href="https://apps.apple.com/us/app/ballmecca/id1663498139"
               class="btn btn-outline-cyan coach-btn" target="_blank">
              View in App
            </a>
          </div>
        </div>
      `;
    });

    // Re-observe new elements
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  } catch (err) {
    console.log('Firebase not configured yet:', err.message);
    // Show placeholder cards when Firebase isn't set up yet
    showPlaceholderCoaches(container);
  }
}

function showPlaceholderCoaches(container) {
  const placeholders = [
    { name: 'Marcus T.', sport: 'Basketball', rating: 5.0, location: 'Los Angeles, CA' },
    { name: 'Coach Denise W.', sport: 'Tennis', rating: 4.9, location: 'Atlanta, GA' },
    { name: 'David R.', sport: 'Baseball', rating: 4.8, location: 'Miami, FL' },
    { name: 'Sarah K.', sport: 'Golf', rating: 4.8, location: 'Phoenix, AZ' },
    { name: 'Coach James L.', sport: 'Football', rating: 4.7, location: 'Chicago, IL' },
  ];
  container.innerHTML = placeholders.map(c => {
    const stars = '★'.repeat(Math.round(c.rating)) + '☆'.repeat(5 - Math.round(c.rating));
    return `
      <div class="coach-card reveal">
        <div class="coach-photo">
          <div class="coach-placeholder">${c.name[0]}</div>
        </div>
        <div class="coach-info">
          <div class="coach-sport">${c.sport}</div>
          <h3 class="coach-name">${c.name}</h3>
          <div class="coach-stars">${stars} <span>${c.rating.toFixed(1)}</span></div>
          <div class="coach-location">📍 ${c.location}</div>
          <a href="https://apps.apple.com/us/app/ballmecca/id1663498139"
             class="btn btn-outline-cyan coach-btn" target="_blank">
            View in App
          </a>
        </div>
      </div>
    `;
  }).join('');
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

loadTopCoaches();

// ── Sport carousel ────────────────────────────────────────────────────────────
const carousel = document.getElementById('sport-carousel');
if (carousel) {
  let isDragging = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carousel.style.cursor = 'grabbing';
  });

  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
    carousel.style.cursor = 'grab';
  });

  carousel.addEventListener('mouseup', () => {
    isDragging = false;
    carousel.style.cursor = 'grab';
  });

  carousel.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  carousel.addEventListener('touchstart', e => {
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  }, { passive: true });

  carousel.addEventListener('touchmove', e => {
    const x = e.touches[0].pageX - carousel.offsetLeft;
    carousel.scrollLeft = scrollLeft - (x - startX);
  }, { passive: true });
}

// ── Hero image rotation ───────────────────────────────────────────────────────
const heroSlides = document.querySelectorAll('.hero-slide');
if (heroSlides.length > 1) {
  let currentSlide = 0;
  setInterval(() => {
    heroSlides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add('active');
  }, 5000);
}
