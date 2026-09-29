(() => {
  'use strict';
  const reviewMode = new URLSearchParams(window.location.search).get('review') === '1';
  document.querySelectorAll('[data-review-only]').forEach(element => { element.hidden = !reviewMode; });
  const cards = [...document.querySelectorAll('.zd-learner[aria-controls]')];
  const closePersonas = () => cards.forEach(card => {
    card.setAttribute('aria-expanded', 'false');
    card.querySelector('.zd-learner-action span').textContent = '＋';
    document.getElementById(card.getAttribute('aria-controls')).hidden = true;
  });
  cards.forEach(card => {
    const panel = document.getElementById(card.getAttribute('aria-controls'));
    card.addEventListener('click', () => {
      const wasOpen = card.getAttribute('aria-expanded') === 'true';
      closePersonas();
      if (!wasOpen) {
        card.setAttribute('aria-expanded', 'true');
        card.querySelector('.zd-learner-action span').textContent = '−';
        panel.hidden = false;
        if (matchMedia('(max-width: 700px)').matches) {
          panel.focus({ preventScroll: true });
          panel.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
      }
    });
    panel.querySelector('.zd-panel-close').addEventListener('click', () => {
      closePersonas();
      card.focus();
    });
  });

  const dialog = document.querySelector('.zd-lightbox');
  const image = document.getElementById('zd-lightbox-image');
  const title = document.getElementById('zd-lightbox-title');
  const caption = document.getElementById('zd-lightbox-caption');
  const originalLink = document.getElementById('zd-lightbox-original');
  let opener = null;
  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      title.textContent = button.dataset.title;
      image.alt = button.dataset.title;
      image.src = button.dataset.image;
      originalLink.href = button.dataset.image;
      caption.textContent = button.dataset.caption;
      dialog.showModal();
    });
  });
  dialog.querySelector('.zd-lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (opener) opener.focus({ preventScroll: true });
    image.removeAttribute('src');
    originalLink.removeAttribute('href');
  });
})();

