const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function runHackerEffect(element) {
  if (!element) return;
  const targetValue = element.dataset.value || element.dataset.originalText || element.innerText.trim();
  element.dataset.value = targetValue;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) {
    element.innerText = targetValue;
    return;
  }

  // Prevent frantic re-triggering with a deliberate cooldown
  const now = performance.now();
  if (element._lastHackedTime && (now - element._lastHackedTime < 2500)) {
    return;
  }
  element._lastHackedTime = now;

  let iteration = 0;
  if (element._hackerInterval) {
    clearInterval(element._hackerInterval);
  }



  element.classList.add("is-glitching", "is-hacking");

  element._hackerInterval = setInterval(() => {
    element.innerText = element.innerText
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return targetValue[index] || "";
        }
        if (targetValue[index] === " " || targetValue[index] === "\n") {
          return targetValue[index];
        }
        return letters[Math.floor(Math.random() * 26)];
      })
      .join("");

    if (iteration >= targetValue.length) {
      clearInterval(element._hackerInterval);
      element._hackerInterval = null;
      element.innerText = targetValue;
      element.classList.remove("is-glitching", "is-hacking");
      element._hasPlayedOnce = true;
    }

    iteration += 0.8;
  }, 65);
}

function initAsciify() {
  const elements = document.querySelectorAll("[data-asciify]");
  elements.forEach((el) => {
    if (!el.dataset.value) {
      el.dataset.value = el.innerText.trim();
    }

    el.onmouseover = (event) => {
      runHackerEffect(event.currentTarget || event.target);
    };
  });

  // Auto-scramble Hero section headings on load and when entering hero
  const heroElements = document.querySelectorAll("#hero [data-asciify]");

  function triggerHeroHeadings() {
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        runHackerEffect(el);
      }, 150 + index * 160);
    });
  }

  // Initial load trigger
  triggerHeroHeadings();

  // Trigger when scrolling into hero
  if ("IntersectionObserver" in window) {
    const heroSec = document.getElementById("hero");
    if (heroSec) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerHeroHeadings();
            }
          });
        },
        { threshold: 0.3 }
      );
      heroObserver.observe(heroSec);
    }
  }
}

window.triggerSectionAsciify = function (sectionId) {
  // Kept for backward compatibility if explicitly needed, but no longer auto-fires on scroll
};

window.triggerSectionHackerText = window.triggerSectionAsciify;
