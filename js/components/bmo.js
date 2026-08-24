(function initBMOParticlesModule() {
  'use strict';

  function initBMOParticles() {
    const container = document.getElementById('hero-bmo-wrap');
    const canvas = document.getElementById('bmo-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const LOGICAL_WIDTH = 480;
    const LOGICAL_HEIGHT = 540;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = LOGICAL_WIDTH * dpr;
      canvas.height = LOGICAL_HEIGHT * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 1. Generate BMO Offscreen Vector Raster to sample particle coordinates
    const offCanvas = document.createElement('canvas');
    offCanvas.width = LOGICAL_WIDTH;
    offCanvas.height = LOGICAL_HEIGHT;
    const offCtx = offCanvas.getContext('2d');

    function drawBMOSprite(c) {
      c.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Chassis Body (Rich Saturated Dark Emerald Green)
      c.fillStyle = '#165b4c';
      c.strokeStyle = '#0e3d30';
      c.lineWidth = 4;
      c.beginPath();
      c.roundRect(125, 75, 230, 285, 20);
      c.fill();
      c.stroke();

      // Chassis Shadow Edge Bevel
      c.fillStyle = '#0e3d30';
      c.beginPath();
      c.roundRect(125, 345, 230, 15, [0, 0, 20, 20]);
      c.fill();

      // Arms
      c.lineWidth = 14;
      c.strokeStyle = '#165b4c';
      c.lineCap = 'round';
      // Left Arm
      c.beginPath();
      c.moveTo(125, 210);
      c.quadraticCurveTo(90, 235, 96, 310);
      c.stroke();
      // Right Arm
      c.beginPath();
      c.moveTo(355, 210);
      c.quadraticCurveTo(390, 235, 384, 310);
      c.stroke();

      // Hands
      c.fillStyle = '#165b4c';
      c.beginPath();
      c.arc(96, 312, 11, 0, Math.PI * 2);
      c.arc(384, 312, 11, 0, Math.PI * 2);
      c.fill();

      // Legs & Feet
      c.fillStyle = '#165b4c';
      c.beginPath();
      c.roundRect(175, 360, 24, 45, [4, 4, 8, 8]);
      c.roundRect(281, 360, 24, 45, [4, 4, 8, 8]);
      c.fill();
      // Feet
      c.beginPath();
      c.roundRect(165, 395, 38, 14, 6);
      c.roundRect(277, 395, 38, 14, 6);
      c.fill();

      // Screen Frame (Dark Forest Frame)
      c.fillStyle = '#0a2b22';
      c.beginPath();
      c.roundRect(147, 95, 186, 128, 12);
      c.fill();

      // Screen Display Face (Mint Jade Glow)
      c.fillStyle = '#82cbb2';
      c.beginPath();
      c.roundRect(153, 101, 174, 116, 8);
      c.fill();

      // Face: Eyes
      c.fillStyle = '#02140d';
      c.beginPath();
      c.arc(195, 145, 6.5, 0, Math.PI * 2);
      c.arc(285, 145, 6.5, 0, Math.PI * 2);
      c.fill();

      // Face: Mouth
      c.beginPath();
      c.arc(240, 160, 22, 0.1 * Math.PI, 0.9 * Math.PI, false);
      c.closePath();
      c.fillStyle = '#0a2b22';
      c.fill();
      c.lineWidth = 3;
      c.strokeStyle = '#02140d';
      c.stroke();
      // Teeth
      c.fillStyle = '#ffffff';
      c.fillRect(226, 160, 28, 7);
      // Tongue
      c.fillStyle = '#ff6b8b';
      c.beginPath();
      c.arc(240, 176, 11, Math.PI, Math.PI * 2, true);
      c.fill();

      // Cartridge Slot
      c.fillStyle = '#02140d';
      c.beginPath();
      c.roundRect(170, 238, 140, 7, 3);
      c.fill();

      // Blue Dot
      c.fillStyle = '#40c4ff';
      c.beginPath();
      c.arc(295, 230, 4.5, 0, Math.PI * 2);
      c.fill();

      // D-Pad (Yellow)
      c.fillStyle = '#ffd15c';
      c.beginPath();
      c.roundRect(165, 265, 14, 42, 3);
      c.roundRect(151, 279, 42, 14, 3);
      c.fill();

      // Cyan Triangle Button
      c.fillStyle = '#40c4ff';
      c.beginPath();
      c.moveTo(234, 272);
      c.lineTo(220, 294);
      c.lineTo(248, 294);
      c.closePath();
      c.fill();

      // Small Green Button
      c.fillStyle = '#00e676';
      c.beginPath();
      c.arc(295, 274, 8, 0, Math.PI * 2);
      c.fill();

      // Big Red/Magenta Action Button
      c.fillStyle = '#ff4081';
      c.beginPath();
      c.arc(268, 308, 16, 0, Math.PI * 2);
      c.fill();

      // Stomach Pill Slots
      c.fillStyle = '#0a2b22';
      c.beginPath();
      c.roundRect(160, 324, 24, 5, 2.5);
      c.roundRect(192, 324, 24, 5, 2.5);
      c.fill();
    }

    drawBMOSprite(offCtx);

    // 2. Sample Pixels into Particle Grid
    const imgData = offCtx.getImageData(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).data;
    const particles = [];
    const STEP = 5; // Grid sampling resolution

    for (let y = 0; y < LOGICAL_HEIGHT; y += STEP) {
      for (let x = 0; x < LOGICAL_WIDTH; x += STEP) {
        const idx = (y * LOGICAL_WIDTH + x) * 4;
        const alpha = imgData[idx + 3];
        if (alpha > 35) {
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          particles.push({
            originX: x,
            originY: y,
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: 0,
            vy: 0,
            color: `rgb(${r},${g},${b})`,
            radius: Math.random() * 0.4 + 1.8,
            mass: Math.random() * 0.4 + 0.8,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    // 3. Physics & Interaction State
    const mouse = {
      x: -9999,
      y: -9999,
      isHovered: false,
      radius: 80,
      repelForce: 8
    };

    let shockwaves = [];
    let isVisible = true;
    let animId = null;

    function getCanvasCoords(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = LOGICAL_WIDTH / rect.width;
      const scaleY = LOGICAL_HEIGHT / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    container.addEventListener('mousemove', (e) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      mouse.x = coords.x;
      mouse.y = coords.y;
      mouse.isHovered = true;
    });

    container.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.isHovered = false;
    });

    // Touch Support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
        mouse.x = coords.x;
        mouse.y = coords.y;
        mouse.isHovered = true;
        createPokeShockwave(coords.x, coords.y);
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
        mouse.x = coords.x;
        mouse.y = coords.y;
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.isHovered = false;
    });

    function createPokeShockwave(x, y) {
      shockwaves.push({
        x: x,
        y: y,
        radius: 5,
        maxRadius: 160,
        strength: 22,
        speed: 9,
        life: 1
      });
    }

    container.addEventListener('click', (e) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      createPokeShockwave(coords.x, coords.y);
    });

    // 4. Animation & Render Loop
    let lastTime = performance.now();

    function render(now) {
      if (!isVisible) return;
      animId = requestAnimationFrame(render);

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      const timeSec = now * 0.002;
      const floatY = Math.sin(timeSec) * 4;
      const floatX = Math.cos(timeSec * 0.5) * 1.5;

      // Update shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.life = 1 - (sw.radius / sw.maxRadius);
        if (sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      // Update and Draw Particles
      const pLen = particles.length;
      for (let i = 0; i < pLen; i++) {
        const p = particles[i];

        // Target idle resting position with natural floating wave
        const targetX = p.originX + floatX + Math.sin(timeSec + p.phase) * 1.2;
        const targetY = p.originY + floatY + Math.cos(timeSec + p.phase) * 1.5;

        // Spring Force towards target
        const dxTarget = targetX - p.x;
        const dyTarget = targetY - p.y;
        const springK = 0.08 / p.mass;
        p.vx += dxTarget * springK;
        p.vy += dyTarget * springK;

        // Mouse Repel Force
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDistSq = mdx * mdx + mdy * mdy;
        const mRadiusSq = mouse.radius * mouse.radius;

        if (mDistSq < mRadiusSq && mDistSq > 0.01) {
          const mDist = Math.sqrt(mDistSq);
          const force = (1 - mDist / mouse.radius) * mouse.repelForce;
          p.vx += (mdx / mDist) * force;
          p.vy += (mdy / mDist) * force;
        }

        // Shockwave Explosions
        const swLen = shockwaves.length;
        for (let j = 0; j < swLen; j++) {
          const sw = shockwaves[j];
          const sdx = p.x - sw.x;
          const sdy = p.y - sw.y;
          const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
          const distDiff = Math.abs(sDist - sw.radius);
          if (distDiff < 25 && sDist > 0.01) {
            const swForce = (1 - distDiff / 25) * sw.strength * sw.life;
            p.vx += (sdx / sDist) * swForce;
            p.vy += (sdy / sDist) * swForce;
          }
        }

        // Damping / Friction
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        // Render Particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Lifecycle Visibility Observer (0% CPU when scrolled away)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              lastTime = performance.now();
              animId = requestAnimationFrame(render);
            }
          } else {
            isVisible = false;
            if (animId) {
              cancelAnimationFrame(animId);
              animId = null;
            }
          }
        });
      }, { threshold: 0.05 });

      observer.observe(container);
    }

    animId = requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBMOParticles);
  } else {
    initBMOParticles();
  }
})();
