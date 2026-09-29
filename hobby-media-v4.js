(() => {
  document.querySelectorAll('[data-hobby-gallery]').forEach(dialog => {
    let opener;
    document.querySelectorAll(`[data-hobby-open="${dialog.id}"]`).forEach(button => {
      button.addEventListener('click', () => {
        opener = button;
        document.querySelectorAll('video').forEach(video => video.pause());
        dialog.showModal();
      });
    });
    dialog.querySelector('[data-hobby-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.querySelectorAll('video').forEach(video => video.pause());
      opener?.focus();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.querySelectorAll('[data-gallery-to]').forEach(button => {
      button.addEventListener('click', () => {
        dialog.querySelectorAll('[data-gallery-panel]').forEach(panel => { panel.hidden = panel.dataset.galleryPanel !== button.dataset.galleryTo; });
        dialog.querySelectorAll('[data-gallery-to]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      });
    });
  });
  document.querySelectorAll('[data-hobby-player]').forEach(player => {
    const videos = [...player.querySelectorAll('[data-hobby-video]')];
    const modes = [...player.querySelectorAll('[data-hobby-mode]')];
    document.addEventListener('keydown', event => {
      const fullscreenVideo = document.fullscreenElement;
      if (event.key === 'Escape' && videos.includes(fullscreenVideo)) {
        document.exitFullscreen().then(() => fullscreenVideo.focus({preventScroll:true})).catch(() => {});
      }
    });
    modes.forEach(button => button.addEventListener('click', () => {
      const next = videos.find(video => video.dataset.hobbyVideo === button.dataset.hobbyMode);
      const current = videos.find(video => !video.hidden);
      if (!next || next === current) return;
      const continuePlaying = current && !current.paused && !current.ended;
      current?.pause();
      videos.forEach(video => { video.hidden = video !== next; });
      modes.forEach(mode => mode.setAttribute('aria-pressed', String(mode === button)));
      if (continuePlaying) next.play().catch(() => {});
    }));
  });
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); }));
  });
})();
