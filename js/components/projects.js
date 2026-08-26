(function setupPixelDissolveCards() {
  function initPixelDissolveCards() {
    const cards = document.querySelectorAll(".project-card");
    if (!cards.length) return;

    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    function deactivateAllCards(exceptCard = null) {
      cards.forEach((c) => {
        if (c !== exceptCard) {
          c.classList.remove("is-pixel-active");
          c.classList.remove("is-expanded");
          c.blur();
          if (c._pixelController) {
            c._pixelController.deactivate();
          }
        }
      });
    }

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
      let progress = 0;
      let targetProgress = 0;
      let lastTime = performance.now();

      const PIXEL_SIZE = 16;
      const DURATION = 320;

      const FLASH_COLORS = [
        "rgba(29, 78, 216, 0.45)",
        "rgba(37, 99, 235, 0.35)",
        "rgba(59, 130, 246, 0.25)",
        "rgba(255, 255, 255, 0.12)",
        "rgba(255, 255, 255, 0.05)",
        "rgba(10, 10, 10, 0.8)",
        "rgba(18, 18, 18, 0.9)",
      ];

      function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
      }

      function easeInCubic(x) {
        return x * x * x;
      }

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

        if (progress > 0) {
          drawFrame();
        }
      }

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
          ctx.fillStyle = p.color;

          const renderSize = PIXEL_SIZE * sizeRatio;
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
            card.classList.remove("is-pixel-active");
            card.classList.remove("is-expanded");
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

      // Controller interface for this card
      card._pixelController = {
        activate: (originX, originY) => {
          isHovered = true;
          targetProgress = 1.0;
          card.classList.add("is-expanded");
          updateOriginDelays(originX, originY);
          startAnimation();
        },
        deactivate: () => {
          isHovered = false;
          targetProgress = 0.0;
          card.classList.remove("is-pixel-active");
          card.classList.remove("is-expanded");
          card.blur();
          updateOriginDelays(width / 2, height / 2);
          startAnimation();
        },
        isActive: () => targetProgress > 0.5 || card.classList.contains("is-expanded") || card.classList.contains("is-pixel-active")
      };

      const ro = new ResizeObserver(() => {
        syncCanvasSize();
      });
      ro.observe(card);

      syncCanvasSize();

      if (!isTouchDevice) {
        card.addEventListener("mouseenter", (e) => {
          const rect = card.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          card._pixelController.activate(mouseX, mouseY);
        });

        card.addEventListener("mouseleave", () => {
          card._pixelController.deactivate();
        });
      }

      card.addEventListener("click", (e) => {
        if (e.target.closest(".project-icon-link")) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const clickX = e.clientX ? e.clientX - rect.left : rect.width / 2;
        const clickY = e.clientY ? e.clientY - rect.top : rect.height / 2;

        if (card._pixelController.isActive()) {
          card._pixelController.deactivate();
        } else {
          deactivateAllCards(card);
          card._pixelController.activate(clickX, clickY);
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".project-card")) {
        deactivateAllCards();
      }
    });

    document.addEventListener(
      "touchstart",
      (e) => {
        if (!e.target.closest(".project-card")) {
          deactivateAllCards();
        }
      },
      { passive: true }
    );
  }

  if ('IntersectionObserver' in window) {
    const projSec = document.getElementById('projects');
    if (projSec) {
      const projObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          initPixelDissolveCards();
          projObs.disconnect();
        }
      }, { rootMargin: '300px' });
      projObs.observe(projSec);
      return;
    }
  }

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(initPixelDissolveCards, { timeout: 500 });
  } else {
    setTimeout(initPixelDissolveCards, 100);
  }
})();
