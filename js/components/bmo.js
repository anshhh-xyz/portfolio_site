/**
 * Exact Adventure Time 3D BMO Robot Mascot
 * Authentic colors, body geometry, face features, buttons, and side "BMO" branding
 * Built with Three.js with full 3D orbital drag, idle float, natural blink & poke reaction.
 */

(function initBMOModule() {
  'use strict';

  function initBMO() {
    const container = document.getElementById('hero-bmo-wrap');
    const canvas = document.getElementById('bmo-canvas');

    if (!container || !canvas || typeof THREE === 'undefined') {
      return;
    }

    const width = 480;
    const height = 540;

    // 1. Scene & Perspective Camera (Generous frustum buffer so hands never clip)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, -0.05, 7.8);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    // 2. Crisp Cartoon-Studio Lighting for Vibrant BMO Colors
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.85);
    sunLight.position.set(4, 6, 6);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xa5f3dc, 0.55);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.35);
    backLight.position.set(0, 5, -5);
    scene.add(backLight);

    // 3. Authentic BMO Color Materials (Deeper rich green tone)
    const BMO_TEAL = 0x3d8a7a; // Deep rich green body tone
    const BMO_TEAL_DARK = 0x286356;
    const BMO_SCREEN_MINT = 0xd2fce6; // Pale mint face screen
    const BMO_SCREEN_BORDER = 0x22554a;
    const BMO_DARK = 0x182c25;
    const BMO_YELLOW = 0xffc72c; // D-Pad yellow
    const BMO_CYAN = 0x00c2de; // Triangle button
    const BMO_GREEN = 0x4bd460; // Green button
    const BMO_RED = 0xe82458; // Big red button
    const BMO_BLUE = 0x12243d; // Slot / blue accents

    const chassisMat = new THREE.MeshStandardMaterial({
      color: BMO_TEAL,
      roughness: 0.35,
      metalness: 0.05
    });

    const chassisEdgeMat = new THREE.MeshStandardMaterial({
      color: BMO_TEAL_DARK,
      roughness: 0.4,
      metalness: 0.05
    });

    const screenBaseMat = new THREE.MeshStandardMaterial({
      color: BMO_SCREEN_MINT,
      roughness: 0.25,
      metalness: 0.02
    });

    const screenBorderMat = new THREE.MeshStandardMaterial({
      color: BMO_SCREEN_BORDER,
      roughness: 0.4
    });

    const eyeMat = new THREE.MeshBasicMaterial({
      color: BMO_DARK
    });

    const slotMat = new THREE.MeshBasicMaterial({
      color: BMO_DARK
    });

    const blueDotMat = new THREE.MeshStandardMaterial({
      color: 0x103b70,
      roughness: 0.3
    });

    const yellowDpadMat = new THREE.MeshStandardMaterial({
      color: BMO_YELLOW,
      roughness: 0.3,
      metalness: 0.05
    });

    const cyanTriangleMat = new THREE.MeshStandardMaterial({
      color: BMO_CYAN,
      roughness: 0.3
    });

    const greenBtnMat = new THREE.MeshStandardMaterial({
      color: BMO_GREEN,
      roughness: 0.3
    });

    const redBtnMat = new THREE.MeshStandardMaterial({
      color: BMO_RED,
      roughness: 0.25,
      metalness: 0.05
    });

    const bluePillMat = new THREE.MeshBasicMaterial({
      color: BMO_BLUE
    });

    // 4. Build Procedural 3D BMO Body
    const bmoGroup = new THREE.Group();

    // A. Main Body Block (Deep rounded box proportion)
    const bodyGeo = new THREE.BoxGeometry(2.35, 2.9, 1.45);
    const bodyMesh = new THREE.Mesh(bodyGeo, chassisMat);
    bmoGroup.add(bodyMesh);

    // Subtle edge rim for cartoon depth
    const edgeGeo = new THREE.BoxGeometry(2.39, 2.94, 1.38);
    const edgeMesh = new THREE.Mesh(edgeGeo, chassisEdgeMat);
    edgeMesh.position.z = -0.02;
    bmoGroup.add(edgeMesh);

    // B. Left & Right Side "BMO" Printed Text + Speaker Holes
    function createSideTexture() {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 512;
      const ctx = cvs.getContext('2d');

      // Base green
      ctx.fillStyle = '#3d8a7a';
      ctx.fillRect(0, 0, 256, 512);

      // Speaker Holes (Cluster of 7 circular dots)
      ctx.fillStyle = '#1e3830';
      const cx = 128;
      const cy = 110;
      const dotOffsets = [
        [0, 0],
        [0, -32],
        [0, 32],
        [-28, -16],
        [28, -16],
        [-28, 16],
        [28, 16]
      ];
      dotOffsets.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 6.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Vertical "B M O" Text (Exact font styling)
      ctx.fillStyle = '#1b322a';
      ctx.font = '900 86px "Arial Black", "Impact", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('B', 128, 235);
      ctx.fillText('M', 128, 318);
      ctx.fillText('O', 128, 400);

      const texture = new THREE.CanvasTexture(cvs);
      texture.needsUpdate = true;
      return texture;
    }

    const sideTexture = createSideTexture();
    const sideMat = new THREE.MeshBasicMaterial({ map: sideTexture });

    // Right side text plate
    const rightPlate = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8), sideMat);
    rightPlate.position.set(1.18, 0, 0);
    rightPlate.rotation.y = Math.PI / 2;
    bmoGroup.add(rightPlate);

    // Left side text plate
    const leftPlate = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8), sideMat);
    leftPlate.position.set(-1.18, 0, 0);
    leftPlate.rotation.y = -Math.PI / 2;
    bmoGroup.add(leftPlate);

    // C. Face Screen (Recessed Bezel + Pale Mint Screen)
    const screenFrameGeo = new THREE.BoxGeometry(1.92, 1.38, 0.05);
    const screenFrame = new THREE.Mesh(screenFrameGeo, screenBorderMat);
    screenFrame.position.set(0, 0.58, 0.72);
    bmoGroup.add(screenFrame);

    const screenGeo = new THREE.BoxGeometry(1.82, 1.28, 0.06);
    const screenMesh = new THREE.Mesh(screenGeo, screenBaseMat);
    screenMesh.position.set(0, 0.58, 0.74);
    bmoGroup.add(screenMesh);

    // D. Facial Features (Eyes + Iconic Open Smile with Teeth)
    const faceGroup = new THREE.Group();
    faceGroup.position.set(0, 0.58, 0.78);

    // Eyes: Two small black dots
    const eyeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.02, 24);
    eyeGeo.rotateX(Math.PI / 2);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.48, 0.16, 0);
    faceGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.48, 0.16, 0);
    faceGroup.add(rightEye);

    // Mouth: Canvas texture for authentic open smile with teeth and mouth cavity
    function createMouthTexture() {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 160;
      const ctx = cvs.getContext('2d');

      ctx.clearRect(0, 0, 256, 160);

      // Mouth outline & cavity
      ctx.beginPath();
      ctx.arc(128, 50, 68, 0, Math.PI, false);
      ctx.closePath();

      ctx.fillStyle = '#2d8262'; // Green mouth interior
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#182c25';
      ctx.stroke();

      // Top White Teeth bar
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(80, 50, 96, 22);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#182c25';
      ctx.strokeRect(80, 50, 96, 22);

      // Tongue curve
      ctx.fillStyle = '#4ecb94';
      ctx.beginPath();
      ctx.arc(128, 105, 42, Math.PI * 1.1, Math.PI * 1.9, false);
      ctx.fill();

      const tex = new THREE.CanvasTexture(cvs);
      tex.needsUpdate = true;
      return tex;
    }

    const mouthTexture = createMouthTexture();
    const mouthGeo = new THREE.PlaneGeometry(0.55, 0.35);
    const mouthMat = new THREE.MeshBasicMaterial({
      map: mouthTexture,
      transparent: true,
      depthWrite: false
    });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.position.set(0, -0.08, 0.005);
    faceGroup.add(mouthMesh);

    bmoGroup.add(faceGroup);

    // E. Front Body Controls & Buttons (Exact Adventure Time Layout)

    // 1. Cartridge Slot (Horizontal dark slit under the screen)
    const slotGeo = new THREE.BoxGeometry(1.45, 0.065, 0.05);
    const slotMesh = new THREE.Mesh(slotGeo, slotMat);
    slotMesh.position.set(0, -0.22, 0.74);
    bmoGroup.add(slotMesh);

    // 2. Small Dark Blue Dot (Upper right under slot)
    const blueDotGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16);
    blueDotGeo.rotateX(Math.PI / 2);
    const blueDot = new THREE.Mesh(blueDotGeo, blueDotMat);
    blueDot.position.set(0.48, -0.32, 0.74);
    bmoGroup.add(blueDot);

    // 3. Golden Yellow D-Pad Cross (Left side)
    const dpadGroup = new THREE.Group();
    dpadGroup.position.set(-0.48, -0.54, 0.75);

    const dpadVert = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.06), yellowDpadMat);
    const dpadHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.06), yellowDpadMat);
    dpadGroup.add(dpadVert);
    dpadGroup.add(dpadHoriz);
    bmoGroup.add(dpadGroup);

    // 4. Cyan Triangle Button (Center middle)
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0.16);
    triangleShape.lineTo(-0.14, -0.1);
    triangleShape.lineTo(0.14, -0.1);
    triangleShape.closePath();

    const triangleGeo = new THREE.ExtrudeGeometry(triangleShape, {
      depth: 0.05,
      bevelEnabled: false
    });
    const triangleMesh = new THREE.Mesh(triangleGeo, cyanTriangleMat);
    triangleMesh.position.set(0.06, -0.56, 0.72);
    bmoGroup.add(triangleMesh);

    // 5. Bright Lime Green Round Button (Right middle)
    const greenBtnGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 20);
    greenBtnGeo.rotateX(Math.PI / 2);
    const greenBtn = new THREE.Mesh(greenBtnGeo, greenBtnMat);
    greenBtn.position.set(0.48, -0.62, 0.74);
    bmoGroup.add(greenBtn);

    // 6. Big Magenta/Red Round Button (Lower right)
    const redBtnGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.08, 28);
    redBtnGeo.rotateX(Math.PI / 2);
    const redBtn = new THREE.Mesh(redBtnGeo, redBtnMat);
    redBtn.position.set(0.22, -0.88, 0.74);
    bmoGroup.add(redBtn);

    // 7. Bottom Horizontal Pill Slots (Lower left & center)
    const pillGeo = new THREE.BoxGeometry(0.24, 0.05, 0.04);

    const pill1 = new THREE.Mesh(pillGeo, bluePillMat);
    pill1.position.set(-0.54, -0.92, 0.74);
    bmoGroup.add(pill1);

    const pill2 = new THREE.Mesh(pillGeo, bluePillMat);
    pill2.position.set(-0.2, -0.92, 0.74);
    bmoGroup.add(pill2);

    // F. Limbs (Arms, 3-finger hands & Legs with authentic cartoon shape)

    // Hand builder helper (mitten palm + 3 cute fingers with joints)
    function createHandMesh() {
      const hand = new THREE.Group();

      // Palm
      const palmGeo = new THREE.SphereGeometry(0.08, 14, 14);
      palmGeo.scale(1.1, 1.3, 0.75);
      const palmMesh = new THREE.Mesh(palmGeo, chassisMat);
      hand.add(palmMesh);

      // 3 cartoon fingers
      for (let i = -1; i <= 1; i++) {
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(i * 0.045, -0.07, 0);

        const fingerGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.1, 10);
        const fingerMesh = new THREE.Mesh(fingerGeo, chassisMat);
        fingerMesh.position.y = -0.04;
        fingerGroup.add(fingerMesh);

        const tipGeo = new THREE.SphereGeometry(0.022, 10, 10);
        const tipMesh = new THREE.Mesh(tipGeo, chassisMat);
        tipMesh.position.y = -0.09;
        fingerGroup.add(tipMesh);

        hand.add(fingerGroup);
      }

      return hand;
    }

    // Left Arm Group (Pivoting from shoulder socket)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-1.18, -0.38, 0);

    const armCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.24, -0.4, 0.08),
      new THREE.Vector3(-0.18, -0.84, 0.18)
    ]);
    const leftArmGeo = new THREE.TubeGeometry(armCurveL, 20, 0.07, 12, false);
    const leftArmMesh = new THREE.Mesh(leftArmGeo, chassisMat);
    leftArmGroup.add(leftArmMesh);

    const leftHand = createHandMesh();
    leftHand.position.set(-0.16, -0.9, 0.2);
    leftHand.rotation.z = 0.15;
    leftHand.rotation.x = 0.2;
    leftArmGroup.add(leftHand);
    bmoGroup.add(leftArmGroup);

    // Right Arm Group (Pivoting from shoulder socket)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(1.18, -0.38, 0);

    const armCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.24, -0.4, 0.12),
      new THREE.Vector3(0.18, -0.84, 0.22)
    ]);
    const rightArmGeo = new THREE.TubeGeometry(armCurveR, 20, 0.07, 12, false);
    const rightArmMesh = new THREE.Mesh(rightArmGeo, chassisMat);
    rightArmGroup.add(rightArmMesh);

    const rightHand = createHandMesh();
    rightHand.position.set(0.16, -0.9, 0.24);
    rightHand.rotation.z = -0.15;
    rightHand.rotation.x = 0.2;
    rightArmGroup.add(rightHand);
    bmoGroup.add(rightArmGroup);

    // Left Leg
    const legCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.46, -1.45, 0),
      new THREE.Vector3(-0.48, -1.95, 0),
      new THREE.Vector3(-0.58, -2.18, 0.18) // foot forward
    ]);
    const leftLegGeo = new THREE.TubeGeometry(legCurveL, 20, 0.08, 12, false);
    const leftLeg = new THREE.Mesh(leftLegGeo, chassisMat);
    bmoGroup.add(leftLeg);

    // Right Leg
    const legCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.46, -1.45, 0),
      new THREE.Vector3(0.48, -1.95, 0),
      new THREE.Vector3(0.58, -2.18, 0.18) // foot forward
    ]);
    const rightLegGeo = new THREE.TubeGeometry(legCurveR, 20, 0.08, 12, false);
    const rightLeg = new THREE.Mesh(rightLegGeo, chassisMat);
    bmoGroup.add(rightLeg);

    bmoGroup.position.set(0, 0.35, 0);
    scene.add(bmoGroup);

    // 5. Interactive Drag/Orbit Controls, Click to Poke & Float Physics
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0.28;
    let targetRotX = 0.06;
    let currentRotY = 0.28;
    let currentRotX = 0.06;
    let pokeJump = 0;
    let blinkTimer = 0;

    // Greeting Wave Animation State
    let isWaving = false;
    let waveStartTime = 0;

    function triggerWave() {
      if (isWaving) return;
      isWaving = true;
      waveStartTime = performance.now();
      pokeJump = 0.28; // Cute welcoming bounce
    }

    // Trigger initial greeting wave on first page load
    setTimeout(triggerWave, 700);

    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      try {
        container.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.012;
        targetRotX += deltaY * 0.008;
        targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    });

    const stopDrag = () => {
      isDragging = false;
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    // Click to Poke / Interact — trigger wave & happy jump
    container.addEventListener('click', () => {
      triggerWave();
      faceGroup.position.y = 0.62;
      setTimeout(() => {
        faceGroup.position.y = 0.58;
      }, 350);
    });

    // 6. Animation & Render Loop with Power Management
    let clock = new THREE.Clock();
    let animFrameId = null;

    function animate() {
      const elapsedTime = clock.getElapsedTime();

      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;

      pokeJump *= 0.88;
      const floatY = Math.sin(elapsedTime * 2.2) * 0.12 + pokeJump;
      const rockZ = Math.cos(elapsedTime * 1.6) * 0.03;

      bmoGroup.position.y = 0.35 + floatY;
      bmoGroup.rotation.y = currentRotY;
      bmoGroup.rotation.x = currentRotX;
      bmoGroup.rotation.z = rockZ;

      // Handle Arm Waving (Upward & forward friendly greeting wave)
      if (isWaving) {
        const waveElapsed = (performance.now() - waveStartTime) / 1000;
        if (waveElapsed < 2.6) {
          // Smooth ease in (0 - 0.45s), wave loop (0.45s - 1.9s), ease out (1.9s - 2.6s)
          const enterT = Math.min(waveElapsed / 0.45, 1.0);
          const exitT = waveElapsed > 1.9 ? Math.max(0, (2.6 - waveElapsed) / 0.7) : 1.0;
          const blend = enterT * exitT;

          // Wave raised upward and forward above the shoulder (stays comfortably inside frame)
          const waveOsc = Math.sin(waveElapsed * 13) * 0.3;
          leftArmGroup.rotation.z = -(1.35 + waveOsc) * blend;
          leftArmGroup.rotation.x = -0.45 * blend;
          leftArmGroup.rotation.y = 0.3 * blend;
          leftHand.rotation.z = (0.15 + Math.sin(waveElapsed * 13) * 0.35) * blend;
        } else {
          isWaving = false;
          leftArmGroup.rotation.z = 0;
          leftArmGroup.rotation.x = 0;
          leftArmGroup.rotation.y = 0;
          leftHand.rotation.z = 0.15;
        }
      }

      // Natural Blink Animation
      blinkTimer += 0.016;
      if (blinkTimer > 3.6) {
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
        if (blinkTimer > 3.75) {
          leftEye.scale.y = 1.0;
          rightEye.scale.y = 1.0;
          blinkTimer = 0;
        }
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    }

    function startLoop() {
      if (!animFrameId) {
        clock.start();
        animFrameId = requestAnimationFrame(animate);
      }
    }

    function stopLoop() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
        clock.stop();
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    });

    startLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBMO);
  } else {
    initBMO();
  }
})();
