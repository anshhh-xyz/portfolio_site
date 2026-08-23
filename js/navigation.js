// ==========================================================================
// Section Navigation & Rail Active State
// ==========================================================================

(function initNavigation() {
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".rail a");
  const html = document.documentElement;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const MOBILE_BREAKPOINT = 900;
  function isMobileViewport() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function setActiveSection(id) {
    html.dataset.active = id;

    navLinks.forEach((link) => {
      const isActive = link.dataset.target === id;
      link.classList.toggle("active", isActive);
      if (isActive && isMobileViewport()) {
        link.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      let best = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
      });
      if (best) setActiveSection(best.target.id);
    },
    { threshold: [0.5] }
  );

  sections.forEach((sec) => observer.observe(sec));

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId =
        link.dataset.target || (link.getAttribute("href") || "").replace("#", "");
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        if (typeof window.smoothScrollTo === "function") {
          window.smoothScrollTo(targetSec, -25);
        } else {
          targetSec.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
        if (typeof window.triggerSectionAsciify === "function") {
          setTimeout(() => window.triggerSectionAsciify(targetId), 250);
        }
      }
    });
  });
})();
