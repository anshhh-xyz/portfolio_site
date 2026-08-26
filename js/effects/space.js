(function setupInteractiveSpaceBackground() {
  const spaceCanvas = document.getElementById("space-canvas");
  if (!spaceCanvas) return;

  const ctx = spaceCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;

  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    radius: 140,
    active: false,
    repelStrength: 10.5
  };

  class Star {
    constructor() {
      this.reset();
      this.phase = Math.random() * Math.PI * 2;
    }

    reset() {
      this.originX = Math.random() * width;
      this.originY = Math.random() * height;
      this.x = this.originX;
      this.y = this.originY;
      this.vx = 0;
      this.vy = 0;

      const rand = Math.random();
      if (rand < 0.55) {
        // Deep background layer (small, subtle)
        this.layer = 1;
        this.baseRadius = Math.random() * 0.45 + 0.35;
        this.baseAlpha = Math.random() * 0.22 + 0.15;
        this.twinkleSpeed = Math.random() * 0.01 + 0.005;
        this.twinkleAmp = Math.random() * 0.12 + 0.06;
        this.color = "#777777";
        this.parallaxFactor = 3;
        this.mass = 1.6;
        this.hasFlares = false;
      } else if (rand < 0.85) {
        // Midground layer (crisp white & silver)
        this.layer = 2;
        this.baseRadius = Math.random() * 0.65 + 0.55;
        this.baseAlpha = Math.random() * 0.32 + 0.25;
        this.twinkleSpeed = Math.random() * 0.015 + 0.008;
        this.twinkleAmp = Math.random() * 0.18 + 0.08;
        this.color = Math.random() < 0.6 ? "#FFFFFF" : "#A3A3A3";
        this.parallaxFactor = 8;
        this.mass = 1.0;
        this.hasFlares = false;
      } else {
        // Foreground layer (bright white & navy highlight)
        this.layer = 3;
        this.baseRadius = Math.random() * 0.9 + 0.8;
        this.baseAlpha = Math.random() * 0.45 + 0.35;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleAmp = Math.random() * 0.22 + 0.1;
        this.color = Math.random() < 0.7 ? "#FFFFFF" : "#1D4ED8";
        this.parallaxFactor = 15;
        this.mass = 0.7;
        this.hasFlares = Math.random() < 0.28;
      }
    }

    update(offsetX, offsetY) {
      this.phase += this.twinkleSpeed;

      const targetX = this.originX + offsetX * (this.parallaxFactor / 100);
      const targetY = this.originY + offsetY * (this.parallaxFactor / 100);

      // Spring force back to target anchor
      const dxTarget = targetX - this.x;
      const dyTarget = targetY - this.y;
      this.vx += dxTarget * 0.045;
      this.vy += dyTarget * 0.045;

      // Mouse interactive force (smooth repulsion)
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = mouse.radius;

        if (distSq < maxDist * maxDist && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / maxDist) * (mouse.repelStrength / this.mass);
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      this.vx *= 0.83;
      this.vy *= 0.83;

      this.x += this.vx;
      this.y += this.vy;
    }

    draw(ctx) {
      const twinkle = Math.sin(this.phase) * this.twinkleAmp;
      const alpha = Math.max(0.04, Math.min(0.95, this.baseAlpha + twinkle));
      const radius = Math.max(0.3, this.baseRadius * (1 + twinkle * 0.35));

      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (this.hasFlares && alpha > 0.45) {
        const spikeLen = radius * 4.2;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.55;
        ctx.globalAlpha = alpha * 0.28;

        ctx.beginPath();
        ctx.moveTo(this.x - spikeLen, this.y);
        ctx.lineTo(this.x + spikeLen, this.y);
        ctx.moveTo(this.x, this.y - spikeLen);
        ctx.lineTo(this.x, this.y + spikeLen);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  class Meteor {
    constructor() {
      this.active = false;
      this.timer = Math.random() * 300 + 120;
    }

    spawn() {
      this.active = true;
      this.x = Math.random() * (width * 0.85) + width * 0.05;
      this.y = Math.random() * (height * 0.35);
      this.length = Math.random() * 70 + 50;
      this.speed = Math.random() * 8 + 9;
      this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25;
      this.alpha = 0.8;
      this.decay = Math.random() * 0.012 + 0.012;
    }

    update() {
      if (!this.active) {
        this.timer--;
        if (this.timer <= 0) {
          this.spawn();
        }
        return;
      }

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.alpha -= this.decay;

      if (this.alpha <= 0 || this.x > width + 100 || this.y > height + 100) {
        this.active = false;
        this.timer = Math.random() * 400 + 220;
      }
    }

    draw(ctx) {
      if (!this.active || this.alpha <= 0) return;

      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(0.65, `rgba(29, 78, 216, ${this.alpha * 0.4})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${this.alpha * 0.9})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let stars = [];
  let meteors = [];

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    spaceCanvas.width = width * dpr;
    spaceCanvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const isSmall = width < 600;
    // Increased star population density
    const count = Math.floor((width * height) / 3200);
    const starCount = isSmall
      ? Math.max(120, Math.min(220, count))
      : Math.max(260, Math.min(480, count));

    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    meteors = isSmall ? [new Meteor()] : [new Meteor(), new Meteor()];

    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        stars[i].draw(ctx);
      }
    }
  }

  let resizeTimer = null;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    },
    { passive: true }
  );
  resize();

  if (prefersReducedMotion) return;

  let targetOffsetX = 0;
  let targetOffsetY = 0;
  let currentOffsetX = 0;
  let currentOffsetY = 0;
  let animFrameId = null;

  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.active = true;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      targetOffsetX = (e.clientX / width - 0.5) * 2;
      targetOffsetY = (e.clientY / height - 0.5) * 2;
    },
    { passive: true }
  );

  window.addEventListener(
    "mouseleave",
    () => {
      mouse.active = false;
    },
    { passive: true }
  );

  // Mobile Touch Support
  window.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length > 0) {
        mouse.active = true;
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      mouse.active = false;
    },
    { passive: true }
  );

  let lastSpaceFrame = 0;
  const isMobileScreen = window.innerWidth < 768;
  const minSpaceInterval = isMobileScreen ? 33 : 16;

  function spaceLoop(now) {
    animFrameId = requestAnimationFrame(spaceLoop);

    if (now && lastSpaceFrame) {
      const elapsed = now - lastSpaceFrame;
      if (elapsed < minSpaceInterval) return;
    }
    lastSpaceFrame = now || performance.now();

    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.04;
    currentOffsetY += (targetOffsetY - currentOffsetY) * 0.04;

    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.2;
      mouse.y += (mouse.targetY - mouse.y) * 0.2;
    }

    ctx.clearRect(0, 0, width, height);

    // Update and draw stars (pure particles, no connecting lines or fading trails)
    for (let i = 0; i < stars.length; i++) {
      stars[i].update(currentOffsetX, currentOffsetY);
      stars[i].draw(ctx);
    }

    // Update and draw meteors
    for (let j = 0; j < meteors.length; j++) {
      meteors[j].update();
      meteors[j].draw(ctx);
    }
  }

  function startLoop() {
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(spaceLoop);
    }
  }

  function stopLoop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => startLoop(), { timeout: 350 });
  } else {
    setTimeout(startLoop, 100);
  }
})();
