(function initYearWaveNavbar() {
  function setupEngine() {
    const activePath = document.getElementById("year-wave-active");
    const glowPath = document.getElementById("year-wave-glow");
    const expSection = document.getElementById("experience");

    if (!activePath || !expSection) return;

    let pathLength = 0;
    try {
      pathLength = activePath.getTotalLength();
    } catch (e) {
      pathLength = 950;
    }

    activePath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    activePath.style.strokeDashoffset = pathLength;

    if (glowPath) {
      glowPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
      glowPath.style.strokeDashoffset = pathLength;
    }

    function applyProgress(progress) {
      const p = Math.max(0, Math.min(progress, 1));
      const offset = pathLength * (1 - p);

      activePath.style.strokeDashoffset = offset;
      if (glowPath) glowPath.style.strokeDashoffset = offset;
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: expSection,
        start: "top 80%",
        end: "bottom 55%",
        scrub: 0.25,
        onUpdate: (self) => {
          applyProgress(self.progress);
        },
      });
    } else {

      let isTicking = false;
      function onScroll() {
        if (!isTicking) {
          isTicking = true;
          requestAnimationFrame(() => {
            const rect = expSection.getBoundingClientRect();
            const winH = window.innerHeight || document.documentElement.clientHeight;
            const start = winH * 0.85;
            const end = winH * 0.15;
            const total = expSection.offsetHeight + (start - end);
            const scrolled = start - rect.top;
            applyProgress(scrolled / (total * 0.7));
            isTicking = false;
          });
        }
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupEngine);
  } else {
    setupEngine();
  }
})();
