(function initNavigation() {
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".rail a");
  const html = document.documentElement;
  const mobileToggle = document.getElementById("rail-mobile-toggle");
  const mobileMenu = document.getElementById("rail-nav-menu");
  const mobileBackdrop = document.getElementById("rail-mobile-backdrop");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const MOBILE_BREAKPOINT = 900;
  function isMobileViewport() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    if (mobileToggle) {
      mobileToggle.classList.remove("is-open");
      mobileToggle.setAttribute("aria-expanded", "false");
    }
    if (mobileBackdrop) {
      mobileBackdrop.classList.remove("is-open");
    }
  }

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    if (mobileToggle) {
      mobileToggle.classList.add("is-open");
      mobileToggle.setAttribute("aria-expanded", "true");
    }
    if (mobileBackdrop) {
      mobileBackdrop.classList.add("is-open");
    }
  }

  function toggleMobileMenu() {
    if (mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", closeMobileMenu);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileViewport()) {
      closeMobileMenu();
    }
  });

  function setActiveSection(id) {
    html.dataset.active = id;

    navLinks.forEach((link) => {
      const isActive = link.dataset.target === id;
      link.classList.toggle("active", isActive);
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
      closeMobileMenu();
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
      }
    });
  });
})();
