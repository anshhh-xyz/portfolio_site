// ==========================================================================
// Deep Space Twinkling Starfield & Meteors Engine
// ==========================================================================

(function setupSpaceBackground() {
  const spaceCanvas = document.getElementById("space-canvas");
  if (!spaceCanvas) return;

  const ctx = spaceCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;

  class Star {
    constructor() {
      this.reset();
      this.phase = Math.random() * Math.PI * 2;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.layer = Math.random() < 0.65 ? 1 : Math.random() < 0.88 ? 2 : 3;

      if (this.layer === 1) {
        this.baseRadius = Math.random() * 0.45 + 0.35;
        this.baseAlpha = Math.random() * 0.18 + 0.12;
        this.twinkleSpeed = Math.random() * 0.008 + 0.004;
        this.twinkleAmp = Math.random() * 0.1 + 0.05;
        this.color = "#a6b8e0";
        this.parallaxFactor = 3;
      } else if (this.layer === 2) {
        this.baseRadius = Math.random() * 0.6 + 0.55;
        this.baseAlpha = Math.random() * 0.28 + 0.22;
        this.twinkleSpeed = Math.random() * 0.012 + 0.006;
        this.twinkleAmp = Math.random() * 0.16 + 0.08;
        this.color = Math.random() < 0.5 ? "#c7d7ff" : "#9bb8ff";
        this.parallaxFactor = 8;
      } else {
        this.baseRadius = Math.random() * 0.8 + 0.75;
        this.baseAlpha = Math.random() * 0.35 + 0.3;
        this.twinkleSpeed = Math.random() * 0.015 + 0.008;
        this.twinkleAmp = Math.random() * 0.2 + 0.1;
        this.color = Math.random() < 0.6 ? "#e2ebff" : "#80aaff";
        this.parallaxFactor = 14;
        this.hasFlares = Math.random() < 0.2;
      }
    }

    update() {
      this.phase += this.twinkleSpeed;
    }

    draw(ctx, offsetX, offsetY) {
      const px = this.x + offsetX * (this.parallaxFactor / 100);
      const py = this.y + offsetY * (this.parallaxFactor / 100);

      const twinkle = Math.sin(this.phase) * this.twinkleAmp;
      const alpha = Math.max(0.04, Math.min(0.85, this.baseAlpha + twinkle));
      const radius = Math.max(0.3, this.baseRadius * (1 + twinkle * 0.4));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();

      if (this.hasFlares && alpha > 0.45) {
        const spikeLen = radius * 4.5;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = alpha * 0.28;

        ctx.beginPath();
        ctx.moveTo(px - spikeLen, py);
        ctx.lineTo(px + spikeLen, py);
        ctx.moveTo(px, py - spikeLen);
        ctx.lineTo(px, py + spikeLen);
        ctx.stroke();
      }

      ctx.restore();
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
      grad.addColorStop(0, "rgba(91, 140, 255, 0)");
      grad.addColorStop(0.7, `rgba(186, 215, 255, ${this.alpha * 0.35})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${this.alpha * 0.7})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.75})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let stars = [];
  let meteors = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    spaceCanvas.width = width * dpr;
    spaceCanvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const count = Math.floor((width * height) / 7500);
    const starCount = Math.max(90, Math.min(170, count));

    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    meteors = [new Meteor(), new Meteor()];
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  let targetOffsetX = 0;
  let targetOffsetY = 0;
  let currentOffsetX = 0;
  let currentOffsetY = 0;

  window.addEventListener("mousemove", (e) => {
    targetOffsetX = (e.clientX / width - 0.5) * 2;
    targetOffsetY = (e.clientY / height - 0.5) * 2;
  }, { passive: true });

  function spaceLoop() {
    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.04;
    currentOffsetY += (targetOffsetY - currentOffsetY) * 0.04;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw(ctx, currentOffsetX, currentOffsetY);
    }

    for (let j = 0; j < meteors.length; j++) {
      meteors[j].update();
      meteors[j].draw(ctx);
    }

    requestAnimationFrame(spaceLoop);
  }

  spaceLoop();
})();
