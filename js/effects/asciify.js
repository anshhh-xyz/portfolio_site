// ==========================================================================
// Smooth Cyber Decryption Wave Engine (Asciify)
// ==========================================================================

const ASCII_GLYPHS = "01_#*+<>:[]/~%&!?$X^";

class AsciifyEffect {
  constructor(element) {
    this.el = element;
    this.originalText = element.dataset.originalText || element.innerText.trim();
    this.el.dataset.originalText = this.originalText;
    this.frameId = null;
    this.isRunning = false;
    this.lastFlipTime = 0;
    this.cachedGlyphs = [];
    this.hasPlayedOnce = false;
  }

  play() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      this.el.innerText = this.originalText;
      return;
    }

    if (this.isRunning) {
      cancelAnimationFrame(this.frameId);
    }
    this.isRunning = true;
    this.el.classList.add("is-glitching");

    const text = this.originalText;
    const length = text.length;
    const duration = Math.min(Math.max(400, length * 18), 620);
    const waveWidth = 3;
    const startTime = performance.now();
    this.lastFlipTime = 0;
    this.cachedGlyphs = new Array(length).fill("");

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth deceleration curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const resolvedHead = Math.floor(easedProgress * (length + waveWidth));
      const lockedCount = Math.max(0, resolvedHead - waveWidth);

      const shouldFlipGlyph = now - this.lastFlipTime > 45;
      if (shouldFlipGlyph) {
        this.lastFlipTime = now;
        for (let i = lockedCount; i < Math.min(length, resolvedHead); i++) {
          this.cachedGlyphs[i] =
            ASCII_GLYPHS[Math.floor(Math.random() * ASCII_GLYPHS.length)];
        }
      }

      let result = "";
      for (let i = 0; i < length; i++) {
        const char = text[i];
        if (char === " " || char === "\n") {
          result += char;
        } else if (i < lockedCount) {
          result += char;
        } else if (i < resolvedHead) {
          result += this.cachedGlyphs[i] || ASCII_GLYPHS[0];
        } else {
          result += char;
        }
      }

      this.el.innerText = result;

      if (progress < 1) {
        this.frameId = requestAnimationFrame(frame);
      } else {
        this.el.innerText = text;
        this.el.classList.remove("is-glitching");
        this.isRunning = false;
        this.hasPlayedOnce = true;
      }
    };

    this.frameId = requestAnimationFrame(frame);
  }

  reset() {
    if (this.isRunning) {
      cancelAnimationFrame(this.frameId);
    }
    this.el.innerText = this.originalText;
    this.el.classList.remove("is-glitching");
    this.isRunning = false;
  }
}

const asciifyInstances = new Map();

function initAsciify() {
  const elements = document.querySelectorAll("[data-asciify]");
  elements.forEach((el) => {
    if (!asciifyInstances.has(el)) {
      const effect = new AsciifyEffect(el);
      asciifyInstances.set(el, effect);

      el.addEventListener("mouseenter", () => effect.play());
    }
  });

  // Smooth scroll trigger for section headings
  const sections = document.querySelectorAll(".section");
  sections.forEach((sec) => {
    const asciifyEls = sec.querySelectorAll("[data-asciify]");
    if (asciifyEls.length === 0) return;

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 80%",
        onEnter: () => {
          asciifyEls.forEach((el) => {
            const instance = asciifyInstances.get(el);
            if (instance) instance.play();
          });
        },
      });
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              asciifyEls.forEach((el) => {
                const instance = asciifyInstances.get(el);
                if (instance) instance.play();
              });
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(sec);
    }
  });
}

// Global helper to trigger decode manually
window.triggerSectionAsciify = function (sectionId) {
  const sec = document.getElementById(sectionId);
  if (!sec) return;
  const asciifyEls = sec.querySelectorAll("[data-asciify]");
  asciifyEls.forEach((el) => {
    const instance = asciifyInstances.get(el);
    if (instance) instance.play();
  });
};
