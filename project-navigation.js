(() => {
  'use strict';

  const projectMenu = document.querySelector('[data-project-menu]');
  if (projectMenu) {
    const trigger = projectMenu.querySelector('button');
    const panel = projectMenu.querySelector('.project-menu');
    let closeTimer;
    let openedByHover = false;
    const setOpen = open => {
      clearTimeout(closeTimer);
      trigger.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (!open) openedByHover = false;
    };
    trigger.addEventListener('click', () => {
      setOpen(openedByHover || panel.hidden);
      openedByHover = false;
    });
    projectMenu.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && panel.hidden) {
        openedByHover = true;
        setOpen(true);
      }
    });
    projectMenu.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      openedByHover = false;
      closeTimer = setTimeout(() => {
        if (!projectMenu.contains(document.activeElement)) setOpen(false);
      }, 150);
    });
    projectMenu.addEventListener('focusout', event => {
      if (!projectMenu.contains(event.relatedTarget)) setOpen(false);
    });
    projectMenu.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.focus();
      } else if (event.key === 'ArrowDown' && event.target === trigger) {
        event.preventDefault();
        setOpen(true);
        panel.querySelector('a').focus();
      }
    });
    panel.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', event => {
      if (!projectMenu.contains(event.target)) setOpen(false);
    });
  }

  const nav = document.querySelector('[data-project-nav]');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  const header = document.querySelector('.site-navigation');
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const threshold = (header?.getBoundingClientRect().height || 0) + nav.getBoundingClientRect().height + 28;
    let active = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= threshold) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', schedule);
  update();
})();
