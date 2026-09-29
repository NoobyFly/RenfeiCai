(() => {
  'use strict';
  const dialog = document.getElementById('research-original');
  if (!dialog || !dialog.showModal) return;
  const viewport = dialog.querySelector('.original-viewport');
  const image = viewport.querySelector('img');
  const fit = dialog.querySelector('[data-original-fit]');
  const zoom = dialog.querySelector('[data-original-zoom]');
  let opener;
  let drag;
  function setZoom(active) {
    viewport.classList.toggle('is-zoomed', active);
    image.style.width = active ? Math.max(image.naturalWidth, viewport.clientWidth * 1.7) + 'px' : '';
    fit.setAttribute('aria-pressed', String(!active));
    zoom.setAttribute('aria-pressed', String(active));
    viewport.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-original-open]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.dataset.originalTitle + '原稿';
      dialog.querySelector('#original-title').textContent = link.dataset.originalTitle;
      setZoom(false);
      dialog.showModal();
    });
  });
  fit.addEventListener('click', () => setZoom(false));
  zoom.addEventListener('click', () => setZoom(true));
  dialog.querySelector('[data-original-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { drag = null; viewport.classList.remove('is-dragging'); opener?.focus(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport.classList.contains('is-zoomed')) return;
    drag = {x:event.clientX, y:event.clientY, left:viewport.scrollLeft, top:viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
    event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    viewport.scrollLeft = drag.left + drag.x - event.clientX;
    viewport.scrollTop = drag.top + drag.y - event.clientY;
  });
  function stopDrag() { drag = null; viewport.classList.remove('is-dragging'); }
  viewport.addEventListener('pointerup', stopDrag);
  viewport.addEventListener('pointercancel', stopDrag);
  image.addEventListener('load', () => { if (viewport.classList.contains('is-zoomed')) setZoom(true); });
})();
