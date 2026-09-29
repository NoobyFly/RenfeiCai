(() => {
  "use strict";

  const page = document.querySelector(".home-page");
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const reviewMode = params.get("review") === "1";
  page.classList.toggle("is-review", reviewMode);
  document.querySelectorAll("[data-review-only]").forEach((note) => {
    note.hidden = !reviewMode;
  });

  if (reviewMode) {
    document.querySelectorAll('a[href^="projects/"]').forEach((link) => {
      const target = new URL(link.getAttribute("href"), window.location.href);
      target.searchParams.set("review", "1");
      link.setAttribute("href", "projects/" + target.pathname.split("/").pop() + target.search + target.hash);
    });
  }

  const emailLink = document.querySelector('.contact-email-address');
  const copyEmail = document.querySelector('[data-copy-email]');
  const copyStatus = document.getElementById('email-copy-status');
  if (emailLink && copyEmail && copyStatus) {
    copyEmail.hidden = false;
    let statusTimer;
    let copying = false;
    copyEmail.addEventListener('click', async () => {
      if (copying) return;
      copying = true;
      const address = emailLink.getAttribute('href').slice('mailto:'.length);
      clearTimeout(statusTimer);
      copyStatus.textContent = '';
      copyEmail.setAttribute('aria-busy', 'true');
      try {
        await navigator.clipboard.writeText(address);
        copyStatus.textContent = '已复制';
      } catch {
        copyStatus.textContent = '未能复制，请长按或选中邮箱复制';
      } finally {
        copying = false;
        copyEmail.removeAttribute('aria-busy');
        statusTimer = setTimeout(() => { copyStatus.textContent = ''; }, 6000);
      }
    });
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (typeof entry.target.animate !== "function" || reducedMotion.matches) continue;
        entry.target.animate(
          [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 600, easing: "cubic-bezier(.2,.65,.3,1)", fill: "none" }
        );
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });
    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
    reducedMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      revealObserver.disconnect();
      if (typeof document.getAnimations === "function") {
        document.getAnimations().forEach((animation) => animation.cancel());
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const navLinks = [...document.querySelectorAll('.site-header nav > a[href^="#"], .site-header [data-nav-section]')];
    const sectionLinks = new Map(navLinks.map((link) => [link.dataset.navSection || link.hash.slice(1), link]));
    const sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link) => link.removeAttribute("aria-current"));
        const activeLink = sectionLinks.get(entry.target.id);
        if (activeLink) activeLink.setAttribute("aria-current", "location");
      }
    }, { rootMargin: "-8% 0px -64% 0px", threshold: 0 });
    document.querySelectorAll("main > section[id]").forEach((section) => sectionObserver.observe(section));
  }
})();
