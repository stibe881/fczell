(function () {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  // Sticky header shadow on scroll
  const header = document.getElementById('siteHeader');
  const back = document.getElementById('backToTop');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    if (back) back.classList.toggle('visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (back) {
    back.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }
})();

/* Lightbox Implementation */
(function() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-close">&times;</div>
    <div class="lightbox-prev">&#10094;</div>
    <div class="lightbox-img-wrapper">
      <img class="lightbox-img" src="" alt="">
    </div>
    <div class="lightbox-next">&#10095;</div>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.lightbox-img');
  const wrapper = overlay.querySelector('.lightbox-img-wrapper');
  
  let currentGallery = [];
  let currentIndex = 0;

  function showImage(index) {
    if (currentGallery.length === 0) return;
    if (index < 0) index = currentGallery.length - 1;
    if (index >= currentGallery.length) index = 0;
    currentIndex = index;
    imgEl.src = currentGallery[currentIndex].href;
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    let trigger = e.target.closest('.lightbox-trigger');
    let img = e.target.closest('.prose img, .gallery-grid img');
    
    // Treat plain images inside prose or gallery as triggers
    if (img && !trigger) {
       if (img.parentElement.tagName === 'A') return; // It's a link to something else
       e.preventDefault();
       const container = img.closest('.gallery-grid') || img.closest('[style*="display:flex"]') || img.parentElement;
       currentGallery = Array.from(container.querySelectorAll('img')).map(i => ({ href: i.src }));
       currentIndex = Array.from(container.querySelectorAll('img')).indexOf(img);
       showImage(currentIndex);
       overlay.classList.add('active');
       document.body.style.overflow = 'hidden';
       return;
    }
    
    if (trigger) {
      e.preventDefault();
      const grid = trigger.closest('.gallery-grid') || trigger.parentElement;
      currentGallery = Array.from(grid.querySelectorAll('.lightbox-trigger')).map(a => ({ href: a.href }));
      currentIndex = Array.from(grid.querySelectorAll('.lightbox-trigger')).indexOf(trigger);
      
      showImage(currentIndex);
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  overlay.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
  overlay.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === wrapper) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  // Swipe support
  let touchstartX = 0;
  let touchendX = 0;
  
  overlay.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
  }, {passive: true});

  overlay.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});

  function handleSwipe() {
    if (touchendX < touchstartX - 50) showImage(currentIndex + 1);
    if (touchendX > touchstartX + 50) showImage(currentIndex - 1);
  }
})();
