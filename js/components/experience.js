(function initYearWaveNavbar() {
  function setupEngine() {
    const activePath = document.getElementById("year-wave-active");
    const glowPath = document.getElementById("year-wave-glow");
    const expSection = document.getElementById("experience");
    const container = document.querySelector(".experience-single-wrap");
    const nodes = document.querySelectorAll(".year-node");

    if (!activePath || !expSection || !container || !nodes.length) return;

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

    // Year node progress milestones along wave
    const yearProgressMap = {
      "2026": 0.05,
      "2027": 0.22,
      "2028": 0.42,
      "2029": 0.61,
      "2030": 0.80,
      "2031": 1.00
    };

    // Cache original 2026 Decofy Card
    const decofyCardHtml = container.innerHTML;

    function renderFutureLoader(year) {
      container.innerHTML = `
        <div class="pixel-loader-wrap" id="pixel-loader-${year}">
          <div class="pixel-loader-header">
            <span class="pixel-loader-msg">downloading...</span>
            <span class="pixel-loader-pct">53.9%</span>
          </div>
          <div class="pixel-loader-track">
            <div class="pixel-loader-fill" style="width: 53.9%;"></div>
          </div>
        </div>
      `;
    }

    function selectYear(selectedYear, targetNode) {
      nodes.forEach((n) => {
        n.classList.remove("is-active", "is-highlighted");
      });

      targetNode.classList.add("is-active", "is-highlighted");

      // Progress along wave
      const progress = yearProgressMap[selectedYear] !== undefined ? yearProgressMap[selectedYear] : 0.05;
      applyProgress(progress);

      if (selectedYear === "2026") {
        container.innerHTML = decofyCardHtml;
      } else {
        renderFutureLoader(selectedYear);
      }
    }

    nodes.forEach((node) => {
      const year = node.getAttribute("data-year");
      node.addEventListener("click", () => selectYear(year, node));
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectYear(year, node);
        }
      });
    });

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
