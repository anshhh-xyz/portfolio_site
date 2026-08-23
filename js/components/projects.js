// ==========================================================================
// High-Performance Pixelated Dissolve Transition & ReactBits Card Engine
// ==========================================================================

(function initPixelDissolveCards() {
  const cards = document.querySelectorAll(".project-card");
  if (!cards.length) return;

  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  cards.forEach((card) => {
    const canvas = card.querySelector(".project-pixel-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let isHovered = false;
    let animReq = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pixels = [];
    let progress = 0; // 0 to 1
    let targetProgress = 0; // 0 or 1
    let lastTime = performance.now();

    const PIXEL_SIZE = 16; // Visible discrete retro pixel block size
    const DURATION = 340; // ms for full dissolve transition

    // Pre-curated flash colors for high-tech pixel transition
    const FLASH_COLORS = [
      "#ffffff",
      "#f8fafc",
      "#f1f5f9",
      "#e2e8f0",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
    ];

    function easeOutCubic(x) {
      return 1 - Math.pow(1 - x, 3);
    }

    function easeInCubic(x) {
      return x * x * x;
    }

    // 1. Build and cache the pixel grid once per layout dimension
    function buildPixelGrid() {
      const cols = Math.ceil(width / PIXEL_SIZE);
      const rows = Math.ceil(height / PIXEL_SIZE);
      const maxDist = Math.hypot(width, height) || 1;
      const ox = width / 2;
      const oy = height / 2;

      pixels = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * PIXEL_SIZE;
          const py = r * PIXEL_SIZE;
          const dist = Math.hypot(px + PIXEL_SIZE / 2 - ox, py + PIXEL_SIZE / 2 - oy);
          const distRatio = dist / maxDist;
          const jitter = Math.random() * 0.35;

          pixels.push({
            x: px,
            y: py,
            jitter: jitter,
            enterDelay: distRatio * 0.35 + jitter,
            leaveDelay: (1 - distRatio) * 0.3 + jitter,
            color: FLASH_COLORS[Math.floor(Math.random() * FLASH_COLORS.length)],
          });
        }
      }
    }

    // 2. Synchronize canvas backing store ONLY on layout resize (never on hover)
    function syncCanvasSize() {
      const rect = card.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const newDpr = Math.min(window.devicePixelRatio || 1, 2);
      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);

      if (width === newWidth && height === newHeight && dpr === newDpr) {
        return;
      }

      width = newWidth;
      height = newHeight;
      dpr = newDpr;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildPixelGrid();

      // Redraw current progress state if active
      if (progress > 0) {
        drawFrame();
      }
    }

    // 3. Fast delay update on cursor interaction (cheap: no canvas resize or memory reallocation)
    function updateOriginDelays(originX, originY) {
      if (!pixels.length) return;

      const ox = originX !== undefined ? originX : width / 2;
      const oy = originY !== undefined ? originY : height / 2;
      const maxDist = Math.hypot(width, height) || 1;

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        const dist = Math.hypot(p.x + PIXEL_SIZE / 2 - ox, p.y + PIXEL_SIZE / 2 - oy);
        const distRatio = dist / maxDist;
        p.enterDelay = distRatio * 0.35 + p.jitter;
        p.leaveDelay = (1 - distRatio) * 0.3 + p.jitter;
      }
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);

      if (progress <= 0) return;

      const isOpening = targetProgress >= progress;

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        const delay = isOpening ? p.enterDelay : p.leaveDelay;
        const localT = Math.max(0, Math.min((progress - delay * 0.4) / 0.6, 1.0));

        if (localT <= 0) continue;

        const sizeRatio = isOpening ? easeOutCubic(localT) : easeInCubic(localT);

        if (localT >= 0.85) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = p.color;
        }

        // Slight 0.75px overlap on full expansion to eliminate sub-pixel seams
        const extra = localT >= 0.95 ? 0.75 : 0;
        const renderSize = PIXEL_SIZE * sizeRatio + extra;
        const offsetX = p.x + (PIXEL_SIZE - renderSize) / 2;
        const offsetY = p.y + (PIXEL_SIZE - renderSize) / 2;

        ctx.fillRect(offsetX, offsetY, renderSize, renderSize);
      }
    }

    function renderLoop(now) {
      const dt = now - lastTime;
      lastTime = now;

      const speed = dt / DURATION;
      if (targetProgress > progress) {
        progress = Math.min(progress + speed, 1.0);
      } else if (targetProgress < progress) {
        progress = Math.max(progress - speed, 0.0);
      }

      // Synchronize DOM text color switch at midpoint
      if (progress >= 0.45 && !card.classList.contains("is-pixel-active")) {
        card.classList.add("is-pixel-active");
      } else if (progress < 0.45 && card.classList.contains("is-pixel-active")) {
        card.classList.remove("is-pixel-active");
      }

      drawFrame();

      if (
        (targetProgress === 1 && progress < 1) ||
        (targetProgress === 0 && progress > 0)
      ) {
        animReq = requestAnimationFrame(renderLoop);
      } else {
        if (progress === 0) {
          ctx.clearRect(0, 0, width, height);
        }
        animReq = null;
      }
    }

    function startAnimation() {
      lastTime = performance.now();
      if (!animReq) {
        animReq = requestAnimationFrame(renderLoop);
      }
    }

    // ResizeObserver watches card layout changes only
    const ro = new ResizeObserver(() => {
      syncCanvasSize();
    });
    ro.observe(card);

    // Initial setup
    syncCanvasSize();

    // Desktop hover interactions
    if (!isTouchDevice) {
      card.addEventListener("mouseenter", (e) => {
        const rect = card.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        isHovered = true;
        targetProgress = 1.0;
        updateOriginDelays(mouseX, mouseY);
        startAnimation();
      });

      card.addEventListener("mouseleave", (e) => {
        const rect = card.getBoundingClientRect();
        const leaveX = e.clientX - rect.left;
        const leaveY = e.clientY - rect.top;
        isHovered = false;
        targetProgress = 0.0;
        updateOriginDelays(leaveX, leaveY);
        startAnimation();
      });
    }

    // Mobile / Touch interactions
    card.addEventListener("click", (e) => {
      if (e.target.closest(".project-icon-link")) {
        return;
      }

      if (isTouchDevice) {
        const wasActive = card.classList.contains("is-pixel-active");

        cards.forEach((c) => {
          if (c !== card) {
            c.classList.remove("is-pixel-active");
          }
        });

        if (wasActive) {
          isHovered = false;
          targetProgress = 0.0;
          updateOriginDelays(width / 2, height / 2);
          startAnimation();
        } else {
          isHovered = true;
          targetProgress = 1.0;
          const rect = card.getBoundingClientRect();
          const mouseX = rect.width / 2;
          const mouseY = rect.height / 2;
          updateOriginDelays(mouseX, mouseY);
          startAnimation();
        }
      }
    });

    // Keyboard accessibility support
    card.addEventListener("focus", () => {
      isHovered = true;
      targetProgress = 1.0;
      updateOriginDelays(width / 2, height / 2);
      startAnimation();
    });

    card.addEventListener("blur", () => {
      isHovered = false;
      targetProgress = 0.0;
      updateOriginDelays(width / 2, height / 2);
      startAnimation();
    });
  });

  // Mobile outside tap dismiss
  if (isTouchDevice) {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".project-card")) {
        cards.forEach((card) => {
          card.classList.remove("is-pixel-active");
        });
      }
    });
  }
})();
