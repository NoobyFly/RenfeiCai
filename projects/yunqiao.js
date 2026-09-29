(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reviewMode = new URLSearchParams(window.location.search).get("review") === "1";
  document.querySelectorAll("[data-editor-note]").forEach((note) => { note.hidden = !reviewMode; });

  document.querySelectorAll("[data-flow-figure]").forEach((figure) => {
    const svg = figure.querySelector("[data-motion-svg]");
    const toggle = figure.querySelector("[data-motion-toggle]");
    if (!svg || !toggle || typeof svg.pauseAnimations !== "function") return;
    let manuallyPaused = reduceMotion.matches;
    let inView = false;
    let started = false;
    const renderMotion = () => {
      const run = !manuallyPaused && inView && !document.hidden;
      if (run && !started) {
        svg.querySelectorAll("animateMotion").forEach((motion) => {
          motion.beginElementAt(parseFloat(motion.dataset.start || "0"));
        });
        started = true;
        figure.dataset.started = "true";
      }
      if (run) svg.unpauseAnimations();
      else svg.pauseAnimations();
      figure.dataset.running = String(run);
      toggle.setAttribute("aria-pressed", String(manuallyPaused));
      toggle.textContent = manuallyPaused ? "播放流动" : "暂停流动";
    };
    toggle.hidden = false;
    toggle.addEventListener("click", () => { manuallyPaused = !manuallyPaused; renderMotion(); });
    reduceMotion.addEventListener("change", (event) => { manuallyPaused = event.matches; renderMotion(); });
    document.addEventListener("visibilitychange", renderMotion);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; renderMotion(); }, { threshold: .05 }).observe(figure);
    } else { inView = true; }
    renderMotion();
  });

  const setupImageControls = (viewer) => {
    const controls = viewer?.querySelector("[data-image-controls]");
    if (!controls) return () => {};
    const fit = controls.querySelector("[data-image-fit]");
    const zoom = controls.querySelector("[data-image-zoom]");
    const hint = controls.querySelector("[data-image-hint]");
    const setZoom = (zoomed) => {
      viewer.classList.toggle("is-zoomed", zoomed);
      fit.setAttribute("aria-pressed", String(!zoomed));
      zoom.setAttribute("aria-pressed", String(zoomed));
      hint.textContent = zoomed ? "左右滑动查看细节；键盘可用方向键。" : "先看完整图版，可放大查看细节。";
      viewer.querySelectorAll(".yq-evidence-image, .yq-map-image").forEach((image) => { image.scrollLeft = 0; });
    };
    controls.hidden = false;
    fit.addEventListener("click", () => setZoom(false));
    zoom.addEventListener("click", () => setZoom(true));
    return setZoom;
  };

  const mapImage = document.querySelector("#price-map-image");
  const mapPlay = document.querySelector("[data-map-play]");
  const dialog = document.querySelector(".yq-map-dialog");
  const setMapZoom = setupImageControls(dialog);
  if (mapImage && mapPlay && dialog) {
    const staticSource = mapImage.getAttribute("src");
    const animatedSource = mapImage.dataset.demoSrc;
    let demoPlaying = false;
    let returnFocus = null;
    const stopDemo = () => {
      demoPlaying = false;
      mapImage.src = staticSource;
      mapPlay.textContent = "播放原型演示 ▷";
      mapPlay.setAttribute("aria-pressed", "false");
    };
    mapPlay.addEventListener("click", () => {
      if (demoPlaying) return stopDemo();
      demoPlaying = true;
      mapImage.src = animatedSource;
      mapPlay.textContent = "停止演示 □";
      mapPlay.setAttribute("aria-pressed", "true");
    });
    mapImage.addEventListener("error", () => {
      if (demoPlaying) { stopDemo(); mapPlay.textContent = "演示加载失败，点击重试"; }
    });
    reduceMotion.addEventListener("change", (event) => { if (event.matches) stopDemo(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden && demoPlaying) stopDemo(); });
    document.querySelectorAll("[data-map-enlarge]").forEach((button) => {
      button.addEventListener("click", () => {
        returnFocus = button;
        if (demoPlaying) stopDemo();
        dialog.querySelector("[data-map-full]").src = staticSource;
        setMapZoom(window.matchMedia("(max-width: 48rem)").matches);
        dialog.showModal();
        dialog.scrollTop = 0;
      });
    });
    dialog.querySelector("[data-map-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      }
    });
    dialog.addEventListener("close", () => { if (returnFocus) returnFocus.focus(); });
  }

  const evidenceDialog = document.querySelector("#team-evidence-dialog");
  const setEvidenceZoom = setupImageControls(evidenceDialog);
  let evidenceTrigger = null;
  if (evidenceDialog) {
    evidenceDialog.querySelector("[data-evidence-close]").addEventListener("click", () => evidenceDialog.close());
    evidenceDialog.addEventListener("click", (event) => {
      if (event.target !== evidenceDialog) return;
      const bounds = evidenceDialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) evidenceDialog.close();
    });
    evidenceDialog.addEventListener("close", () => { if (evidenceTrigger) evidenceTrigger.focus(); });
  }

  // Keep the full team structure visible; open the material behind each role.
  document.querySelectorAll("[data-team-map]").forEach((map) => {
    const lanes = Array.from(map.querySelectorAll("[data-team-lane]"));
    let selected = null;
    const select = (key) => {
      selected = key;
      map.classList.toggle("has-selection", selected !== null);
      lanes.forEach((lane) => {
        const active = lane.dataset.teamLane === selected;
        lane.classList.toggle("is-selected", active);
        lane.querySelector("[data-team-select]").setAttribute("aria-pressed", String(active));
      });
    };
    lanes.forEach((lane) => {
      const button = lane.querySelector("[data-team-select]");
      button.addEventListener("click", () => {
        const key = button.dataset.teamSelect;
        select(key);
        if (!evidenceDialog) return;
        evidenceTrigger = button;
        evidenceDialog.querySelectorAll("[data-evidence-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.evidencePanel !== key;
        });
        evidenceDialog.querySelector("#evidence-dialog-title").textContent = button.querySelector("strong").textContent + " · 例证";
        setEvidenceZoom(false);
        evidenceDialog.showModal();
        evidenceDialog.scrollTop = 0;
      });
    });
    map.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && selected !== null) {
        select(null);
        event.stopPropagation();
      }
    });
  });
})();
