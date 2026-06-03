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

  const firebaseConfig = {
    apiKey: "AIzaSyAEkVndOa6OtO777yrG7JkYNuOeBbUNhgs",
    authDomain: "ballmecca-982c8.firebaseapp.com",
    projectId: "ballmecca-982c8",
    storageBucket: "ballmecca-982c8.appspot.com",
    messagingSenderId: "677614688397",
    appId: "1:677614688397:web:d371d405eb49b003dc6ac4",
    measurementId: "G-4MSK09MLJD"
  };

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
    const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js');
    const { getFirestore, collection, query, orderBy, limit, getDocs } =
      await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

    const app = initializeApp(firebaseConfig, 'ballmecca-web');
    getAnalytics(app);
    const db = getFirestore(app);

    const q = query(
      collection(db, 'coaches'),
      orderBy('years_pc', 'desc'),
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

    const coaches = [];
    snap.forEach(doc => coaches.push(doc.data()));
    renderCoachCards(container, coaches);

  } catch (err) {
    console.error('Coach load error:', err.message);
    showPlaceholderCoaches(container);
  }
}

function renderCoachCards(container, coaches) {
  if (!coaches || coaches.length === 0) {
    container.innerHTML = `<p class="text-muted text-center" style="grid-column:1/-1;padding:48px 0;">
      Coaches coming soon — <a href="https://apps.apple.com/us/app/ballmecca/id1663498139"
      style="color:var(--cyan)">download the app</a> to be first.
    </p>`;
    return;
  }

  container.innerHTML = coaches.map(c => {
    const photo = c.photoUrl || c.photoURL || c.profileImageUrl || c.photo || '';
    const name = c.displayName || c.name || c.fullName || 'Coach';
    const photoHtml = photo
      ? `<img src="${photo}" alt="${name}" loading="lazy">`
      : `<div class="coach-placeholder">${name[0]}</div>`;
    const sport = Array.isArray(c.sports) && c.sports.length ? c.sports.join(', ') : (c.sport || 'Multi-sport');
    const location = c.location || c.city || '';
    const years = c.years_pc;
    return `
      <div class="coach-card reveal">
        <div class="coach-photo">${photoHtml}</div>
        <div class="coach-info">
          <div class="coach-sport">${sport}</div>
          <h3 class="coach-name">${name}</h3>
          ${years > 0 ? `<div class="coach-stars">${years} yr${years !== 1 ? 's' : ''} experience</div>` : ''}
          ${location ? `<div class="coach-location">📍 ${location}</div>` : ''}
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
