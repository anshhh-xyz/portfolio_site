// ==========================================================================
// True Pixelated Dissolve Transition & ReactBits Card Engine
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

    const ctx = canvas.getContext("2d");
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
    let mouseX = -1000;
    let mouseY = -1000;

    const PIXEL_SIZE = 14; // Visible discrete pixel block size
    const DURATION = 360; // ms for full dissolve

    // Intermediate flash colors during pixel expansion
    const FLASH_COLORS = [
      "#ffffff",
      "#f1f5f9",
      "#e2e8f0",
      "#cbd5e1",
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

    function initPixelGrid(originX, originY) {
      const rect = card.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / PIXEL_SIZE);
      const rows = Math.ceil(height / PIXEL_SIZE);
      const maxDist = Math.hypot(width, height) || 1;

      const ox = originX !== undefined ? originX : width / 2;
      const oy = originY !== undefined ? originY : height / 2;

      pixels = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * PIXEL_SIZE;
          const py = r * PIXEL_SIZE;
          const dist = Math.hypot(px + PIXEL_SIZE / 2 - ox, py + PIXEL_SIZE / 2 - oy);
          const distRatio = dist / maxDist;

          // Wave delay from cursor + randomized jitter for authentic pixel scramble
          const enterDelay = distRatio * 0.35 + Math.random() * 0.35;
          const leaveDelay = (1 - distRatio) * 0.3 + Math.random() * 0.35;

          pixels.push({
            x: px,
            y: py,
            enterDelay: enterDelay,
            leaveDelay: leaveDelay,
            color: FLASH_COLORS[Math.floor(Math.random() * FLASH_COLORS.length)],
            shimmerOffset: Math.random() * Math.PI * 2,
          });
        }
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

      // Synchronize DOM text color switch and brief reveal at midpoint
      if (progress >= 0.45 && !card.classList.contains("is-pixel-active")) {
        card.classList.add("is-pixel-active");
      } else if (progress < 0.45 && card.classList.contains("is-pixel-active")) {
        card.classList.remove("is-pixel-active");
      }

      ctx.clearRect(0, 0, width, height);

      if (progress > 0) {
        const isOpening = targetProgress >= progress;

        for (let i = 0; i < pixels.length; i++) {
          const p = pixels[i];
          const delay = isOpening ? p.enterDelay : p.leaveDelay;
          const localT = Math.max(0, Math.min((progress - delay * 0.4) / 0.6, 1.0));

          if (localT <= 0) continue;

          let sizeRatio = isOpening ? easeOutCubic(localT) : easeInCubic(localT);

          // Fill color
          if (localT >= 0.85) {
            ctx.fillStyle = "#ffffff";
          } else {
            ctx.fillStyle = p.color;
          }

          // At full expansion, add slight overlap to eliminate tile seams
          const extra = localT >= 0.95 ? 0.75 : 0;
          const renderSize = PIXEL_SIZE * sizeRatio + extra;
          const offsetX = p.x + (PIXEL_SIZE - renderSize) / 2;
          const offsetY = p.y + (PIXEL_SIZE - renderSize) / 2;

          ctx.fillRect(offsetX, offsetY, renderSize, renderSize);
        }

        // Interactive cursor micro-shimmer when fully white
        if (progress >= 0.98 && mouseX >= 0 && mouseY >= 0) {
          for (let i = 0; i < pixels.length; i++) {
            const p = pixels[i];
            const dist = Math.hypot(p.x + PIXEL_SIZE / 2 - mouseX, p.y + PIXEL_SIZE / 2 - mouseY);
            if (dist < 80) {
              const shimmer = Math.sin(now * 0.008 + p.shimmerOffset) * 0.5 + 0.5;
              if (shimmer > 0.6) {
                ctx.fillStyle = "rgba(226, 232, 240, 0.6)";
                ctx.fillRect(p.x, p.y, PIXEL_SIZE, PIXEL_SIZE);
              }
            }
          }
        }
      }

      if ((targetProgress === 1 && progress < 1) || (targetProgress === 0 && progress > 0) || (progress >= 0.98 && isHovered)) {
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

    // Resize observer
    const ro = new ResizeObserver(() => {
      initPixelGrid();
    });
    ro.observe(card);

    initPixelGrid();

    // Desktop hover & mousemove
    if (!isTouchDevice) {
      card.addEventListener("mouseenter", (e) => {
        const rect = card.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isHovered = true;
        targetProgress = 1.0;
        initPixelGrid(mouseX, mouseY);
        startAnimation();
      });

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        if (!isHovered) {
          isHovered = true;
          targetProgress = 1.0;
          initPixelGrid(mouseX, mouseY);
          startAnimation();
        }
      });

      card.addEventListener("mouseleave", (e) => {
        const rect = card.getBoundingClientRect();
        const leaveX = e.clientX - rect.left;
        const leaveY = e.clientY - rect.top;
        isHovered = false;
        targetProgress = 0.0;
        mouseX = -1000;
        mouseY = -1000;
        initPixelGrid(leaveX, leaveY);
        startAnimation();
      });
    }

    // Mobile / Touch interaction
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
          mouseX = -1000;
          mouseY = -1000;
          initPixelGrid(width / 2, height / 2);
          startAnimation();
        } else {
          isHovered = true;
          targetProgress = 1.0;
          const rect = card.getBoundingClientRect();
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
          initPixelGrid(mouseX, mouseY);
          startAnimation();
        }
      }
    });

    // Keyboard focus support
    card.addEventListener("focus", () => {
      isHovered = true;
      targetProgress = 1.0;
      initPixelGrid(width / 2, height / 2);
      startAnimation();
    });

    card.addEventListener("blur", () => {
      isHovered = false;
      targetProgress = 0.0;
      initPixelGrid(width / 2, height / 2);
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
