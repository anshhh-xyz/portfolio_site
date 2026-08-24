const CHARSETS = {
  ascii: [
    0, 128, 131200, 14336, 459200, 469440, 4357252, 18157905, 11512810,
    15724526,
  ],
  blocks: [0, 328000, 22041621, 22369621, 11512810, 33554431],
  binary: [0, 4591758, 15324974],
};

const FADE_OUT_S = 0.45;
const MAX_GLYPHS = 16;
const FALLBACK_CAPTURE_DELAY = 500;

const DEFAULTS = {
  angle: 0,
  duration: 0.8,
  band: 0.28,
  softness: 0.45,
  turbulence: 0.5,
  trail: 0.75,
  progress: -1,
  scale: 2,
  spacing: 1,
  charset: "ascii",
  glyphs: [],
  color: "#FFFFFF",
  tint: 0.75,
  glow: 2,
  aberration: 5,
  flicker: 0.35,
  density: 0.9,
  displace: 14,
  contrast: 1.2,
  brightness: 0,
  invert: 0,
  threshold: 0.1,
  fade: 0.75,
  blend: "auto",
  background: "auto",
  onSweepStart: () => {},
  onSweepEnd: () => {},
};

const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uResolution;
uniform float uProgress;
uniform vec2 uDir;
uniform float uBand;
uniform float uSoftness;
uniform float uTurbulence;
uniform float uTrail;
uniform float uGlyphPx;
uniform float uSpacing;
uniform uint uGlyphs[${MAX_GLYPHS}];
uniform int uGlyphCount;
uniform vec3 uInk;
uniform float uTint;
uniform float uGlow;
uniform float uAberration;
uniform float uFlicker;
uniform float uDensity;
uniform float uDisplace;
uniform float uContrast;
uniform float uBrightness;
uniform float uInvert;
uniform float uThreshold;
uniform float uFade;
uniform float uAdditive;
uniform vec3 uBg;
uniform float uBgLum;
uniform float uTime;
uniform float uLod;
uniform float uActive;
uniform float uMaxX;

#define S(a, b, t) smoothstep(a, b, t)

float glyphBit (int index, ivec2 p) {
  if (p.x < 0 || p.x > 4 || p.y < 0 || p.y > 4) return 0.0;
  uint bits = uGlyphs[index];
  return float((bits >> uint((4 - p.x) + 5 * p.y)) & 1u);
}

float hash21 (vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash31 (vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

vec4 panel (sampler2D tex, vec2 uv, float lod, vec2 fringe) {
  vec4 c = textureLod(tex, uv, lod);
  if (uAberration > 0.001) {
    c.r = textureLod(tex, uv + fringe, lod).r;
    c.b = textureLod(tex, uv - fringe, lod).b;
  }
  return c;
}

void main () {
  if (uActive < 0.001) {
    outColor = vec4(0.0);
    return;
  }

  vec2 uv = vUv;
  if (uv.x > uMaxX) {
    outColor = vec4(0.0);
    return;
  }
  float cellPx = max((5.0 + 2.0 * uSpacing) * uGlyphPx, 1.0);
  vec2 frag = uv * uResolution;
  vec2 cell = floor(frag / cellPx);
  vec2 cellUv = (cell + 0.5) * cellPx / uResolution;

  float extent = max(0.5 * (abs(uDir.x) + abs(uDir.y)), 1e-4);
  float axis = dot(cellUv - 0.5, uDir) / (2.0 * extent) + 0.5;

  float band = max(uBand, 1e-3);

  float rowSeed = hash21(vec2(floor(cell.y * 0.5), 19.7)) - 0.5;
  float cellSeed = hash21(cell * 0.37 + 3.1) - 0.5;
  float jitter = (rowSeed * 0.8 + cellSeed * 0.4) * uTurbulence * band;
  axis += jitter;

  float feather = max(clamp(uSoftness, 0.0, 1.0) * band, 1e-4);

  float glowSpan = band * (1.0 + uTrail) + feather;
  float travel = 1.0 + band * (1.0 + uTrail) + uTurbulence * band;
  float head = uProgress * travel;
  float behind = head - axis;
  float swap = S(band * 0.30, band * 0.62, behind);
  float enter = S(0.0, feather, behind);
  float leave = 1.0 - S(band, band + max(uTrail, 0.001) * band, behind);
  float ascii = clamp(enter * leave, 0.0, 1.0);

  float aura = (1.0 - S(0.0, glowSpan, abs(behind - band * 0.5)))
    * S(-feather * 2.0, feather, behind);

  vec2 fringe = (uDir * uAberration * max(ascii, aura * 0.5))
    / max(uResolution, vec2(1.0));

  vec2 texUv = vec2(uv.x, 1.0 - uv.y);
  if (uDisplace > 0.001) {
    float sliceH = max(cellPx * 1.6, 2.0);
    float slice = floor(frag.y / sliceH);
    float tick = floor(uTime * 12.0);
    float pick = hash21(vec2(slice, tick));
    float tear = (hash21(vec2(slice * 1.7, tick * 0.31)) - 0.5)
      * step(0.45, pick);
    texUv.x += (tear * 2.0 * uDisplace * ascii) / max(uResolution.x, 1.0);
  }

  vec3 base = vec3(0.0);
  float alpha = 0.0;

  vec2 cellTexUv = vec2(cellUv.x, 1.0 - cellUv.y);

  if (aura > 0.002) {
    vec2 spread = vec2(cellPx) / max(uResolution, vec2(1.0));
    float edge = 0.0;
    for (int i = 0; i < 5; i++) {
      vec2 tap = vec2(
        float(i == 1) - float(i == 2),
        float(i == 3) - float(i == 4)) * spread;
      vec4 sFrom = textureLod(uFrom, texUv + tap, uLod);
      vec4 sTo = textureLod(uTo, texUv + tap, uLod);
      vec4 bFrom = textureLod(uFrom, texUv + tap, uLod + 2.5);
      vec4 bTo = textureLod(uTo, texUv + tap, uLod + 2.5);
      vec3 sharpRgb = mix(
        mix(uBg, sFrom.rgb, sFrom.a), mix(uBg, sTo.rgb, sTo.a), swap);
      vec3 broadRgb = mix(
        mix(uBg, bFrom.rgb, bFrom.a), mix(uBg, bTo.rgb, bTo.a), swap);
      edge += abs(
        dot(sharpRgb, vec3(0.299, 0.587, 0.114)) -
        dot(broadRgb, vec3(0.299, 0.587, 0.114)));
    }
    edge = clamp(edge / (5.0 * 0.16), 0.0, 1.0);
    float haze = edge * aura * clamp(uGlow, 0.0, 2.0) * 0.5;
    base += uInk * haze * (0.55 + 0.85 * uAdditive);
    alpha = max(alpha, haze * 0.8);
  }

  if (ascii > 0.002) {
    vec4 cellFrom = panel(uFrom, cellTexUv, uLod, fringe);
    vec4 cellTo = panel(uTo, cellTexUv, uLod, fringe);
    vec3 cellRgb = mix(
      mix(uBg, cellFrom.rgb, cellFrom.a),
      mix(uBg, cellTo.rgb, cellTo.a),
      swap);

    float lum = dot(cellRgb, vec3(0.299, 0.587, 0.114));
    float ink = abs(lum - uBgLum);
    float present = S(uThreshold * 0.5, uThreshold + 0.02, ink);

    vec4 broadFrom = textureLod(uFrom, cellTexUv, uLod + 2.5);
    vec4 broadTo = textureLod(uTo, cellTexUv, uLod + 2.5);
    vec3 broadRgb = mix(
      mix(uBg, broadFrom.rgb, broadFrom.a),
      mix(uBg, broadTo.rgb, broadTo.a),
      swap);
    float detail = abs(lum - dot(broadRgb, vec3(0.299, 0.587, 0.114)));
    present *= mix(0.5, 1.0, S(0.01, uThreshold + 0.06, detail));

    present *= step(hash21(cell + 11.3), clamp(uDensity, 0.0, 1.0));
    if (uFlicker > 0.001) {
      float roll = hash31(vec3(cell, floor(uTime * 18.0)));
      present *= 1.0 - clamp(uFlicker, 0.0, 1.0) * step(roll, 0.4);
    }

    float t = clamp(ink / 0.35, 0.0, 1.0);
    float amount = clamp((t - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
    amount = mix(amount, 1.0 - amount, clamp(uInvert, 0.0, 1.0));

    float churn = hash31(vec3(cell, floor(uTime * 15.0))) - 0.5;
    float picked = clamp(amount + churn * 0.25, 0.0, 1.0);
    int index = min(int(picked * float(uGlyphCount)), uGlyphCount - 1);

    ivec2 local = ivec2(floor((frag - cell * cellPx) / max(uGlyphPx, 0.001)));
    int pad = int(uSpacing);
    float on = glyphBit(index, ivec2(local.x - pad, local.y - pad));

    vec3 contentInk = clamp(uBg + (cellRgb - uBg) / max(ink, 0.2), 0.0, 1.0);
    vec3 glyphColor = mix(contentInk, uInk, clamp(uTint, 0.0, 1.0));
    float level = 0.72 + 0.28 * hash21(cell * 0.91 + 7.7);
    glyphColor *= level;
    glyphColor = mix(glyphColor, vec3(1.0),
      amount * amount * level * 0.55 * uAdditive);

    float strength = ascii * present;
    float lit = on * strength;

    base += glyphColor * lit;
    alpha = max(alpha, lit);
  }

  base = clamp(base, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0) * uActive;
  outColor = vec4(base * alpha, alpha);
}`;

const svgCache = new WeakMap();
function getSvgImage(svgEl) {
  let img = svgCache.get(svgEl);
  if (!img) {
    img = new Image();
    const svgXml = new XMLSerializer().serializeToString(svgEl);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgXml);
    svgCache.set(svgEl, img);
  }
  return img;
}

function intersectFallbackRects(first, second) {
  return {
    left: Math.max(first.left, second.left),
    top: Math.max(first.top, second.top),
    right: Math.min(first.right, second.right),
    bottom: Math.min(first.bottom, second.bottom),
  };
}

function paintFallbackSnapshot(content, canvas) {
  const rootRect = content.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rootRect.width * dpr));
  const height = Math.max(1, Math.round(rootRect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.resetTransform ? ctx.resetTransform() : ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.scale(dpr, dpr);

  const rootClip = {
    left: rootRect.left,
    top: rootRect.top,
    right: rootRect.right,
    bottom: rootRect.bottom,
  };
  const states = new WeakMap();

  function resolveState(element) {
    const cached = states.get(element);
    if (cached) return cached;

    const parent = element.parentElement;
    const parentState = parent && content.contains(parent) ? resolveState(parent) : null;
    const style = getComputedStyle(element);
    const visible = style.display !== "none";
    const clip = parentState?.childrenClip ?? rootClip;
    const rect = element.getBoundingClientRect();
    const childrenClip = { ...clip };
    if (style.overflowX !== "visible") {
      childrenClip.left = Math.max(childrenClip.left, rect.left);
      childrenClip.right = Math.min(childrenClip.right, rect.right);
    }
    if (style.overflowY !== "visible") {
      childrenClip.top = Math.max(childrenClip.top, rect.top);
      childrenClip.bottom = Math.min(childrenClip.bottom, rect.bottom);
    }

    const state = { style, visible, opacity: 1, clip, childrenClip };
    states.set(element, state);
    return state;
  }

  const walker = document.createTreeWalker(content, NodeFilter.SHOW_ELEMENT);
  let current = walker.currentNode;
  while (current) {
    const element = current;
    const rect = element.getBoundingClientRect();
    const state = resolveState(element);
    const visibleRect = intersectFallbackRects(rect, state.clip);
    if (
      state.visible &&
      visibleRect.right > visibleRect.left &&
      visibleRect.bottom > visibleRect.top
    ) {
      const { style } = state;
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        state.clip.left - rootRect.left,
        state.clip.top - rootRect.top,
        state.clip.right - state.clip.left,
        state.clip.bottom - state.clip.top
      );
      ctx.clip();
      ctx.globalAlpha = state.opacity;
      const x = rect.left - rootRect.left;
      const y = rect.top - rootRect.top;

      if (style.backgroundColor !== "transparent" && style.backgroundColor !== "rgba(0, 0, 0, 0)") {
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(x, y, rect.width, rect.height);
      }

      paintFallbackMedia(ctx, element, style, rect, rootRect);
      paintFallbackText(ctx, element, style, rootRect);
      paintFallbackBorders(ctx, style, rect, rootRect);
      ctx.restore();
    }
    current = walker.nextNode();
  }
  ctx.globalAlpha = 1;
}

function paintFallbackMedia(ctx, element, style, rect, rootRect) {
  let drawable = null;
  if (element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0) {
    drawable = element;
  } else if (element instanceof HTMLCanvasElement) {
    drawable = element;
  } else if (element instanceof SVGElement && element.tagName.toLowerCase() === "svg") {
    drawable = getSvgImage(element);
  }
  if (!drawable) return;

  const targetX = rect.left - rootRect.left;
  const targetY = rect.top - rootRect.top;
  try {
    ctx.drawImage(drawable, targetX, targetY, rect.width, rect.height);
  } catch {}
}

function paintFallbackText(ctx, element, style, rootRect) {
  const textNodes = Array.from(element.childNodes).filter(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
  );
  if (textNodes.length === 0) return;

  ctx.fillStyle = style.color;
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  for (const node of textNodes) {
    const text = node.textContent.trim();
    if (!text) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects());
    rects.forEach((rect) => {
      const x = rect.left - rootRect.left;
      const y = rect.top - rootRect.top + rect.height / 2;
      ctx.fillText(text, x, y);
    });
  }
}

function paintFallbackBorders(ctx, style, rect, rootRect) {
  const x = rect.left - rootRect.left;
  const y = rect.top - rootRect.top;
  const top = Number.parseFloat(style.borderTopWidth) || 0;
  const right = Number.parseFloat(style.borderRightWidth) || 0;
  const bottom = Number.parseFloat(style.borderBottomWidth) || 0;
  const left = Number.parseFloat(style.borderLeftWidth) || 0;

  if (top > 0) {
    ctx.fillStyle = style.borderTopColor;
    ctx.fillRect(x, y, rect.width, top);
  }
  if (right > 0) {
    ctx.fillStyle = style.borderRightColor;
    ctx.fillRect(x + rect.width - right, y, right, rect.height);
  }
  if (bottom > 0) {
    ctx.fillStyle = style.borderBottomColor;
    ctx.fillRect(x, y + rect.height - bottom, rect.width, bottom);
  }
  if (left > 0) {
    ctx.fillStyle = style.borderLeftColor;
    ctx.fillRect(x, y, left, rect.height);
  }
}

function createAsciiSweep(elements, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const { slots, output } = elements;
  if (!slots || slots.length !== 2) return null;

  const gl = output.getContext("webgl2", {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
  });
  if (!gl || gl.isContextLost()) return null;

  const probeCtx = (() => {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    return probe.getContext("2d", { willReadFrequently: true });
  })();

  function parseColor(value) {
    if (!probeCtx || !value) return null;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = "#000";
    probeCtx.fillStyle = value;
    const resolved = probeCtx.fillStyle;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = resolved;
    probeCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return null;
    return [r / 255, g / 255, b / 255];
  }

  let destroyed = false;
  let wake = () => {};

  function compile(type, text) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Unknown shader error";
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  const vertexShader = compile(gl.VERTEX_SHADER, VERT);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const uniforms = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; i++) {
    const info = gl.getActiveUniform(program, i);
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function createSlotTexture() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );
    return texture;
  }

  const states = slots.map((slot) => ({
    source: slot.source,
    content: slot.content,
    texture: createSlotTexture(),
    fallbackCanvas: slot.source,
    dirty: false,
    stamp: 0,
    captureTimer: 0,
    captureDeadline: 0,
  }));

  function captureFallback(state) {
    try {
      paintFallbackSnapshot(state.content, state.source);
      if (destroyed) return;
      state.fallbackCanvas = state.source;
      state.dirty = true;
      wake();
    } catch (e) {
      console.warn("AsciiSweep fallback capture error:", e);
    }
  }

  function queueCapture(state, immediate = false) {
    if (destroyed) return;
    const delay = immediate ? 0 : FALLBACK_CAPTURE_DELAY;
    window.clearTimeout(state.captureTimer);
    state.captureTimer = window.setTimeout(() => captureFallback(state), delay);
  }

  function requestCapture(immediate = false) {
    for (const state of states) {
      queueCapture(state, immediate);
    }
  }

  function applyStacking(shown) {
    states.forEach((state, index) => {
      const front = index === shown;
      const slotEl = state.content.closest(".skills-slot") || state.content;
      slotEl.classList.toggle("is-active", front);
      slotEl.style.zIndex = front ? "1" : "0";
      slotEl.style.pointerEvents = front ? "" : "none";
      if (front) slotEl.removeAttribute("aria-hidden");
      else slotEl.setAttribute("aria-hidden", "true");
    });
  }

  let contentMaxX = 1;

  function syncCanvasSize() {
    let changed = false;
    contentMaxX = Math.min(
      1,
      Math.max(
        0.05,
        states[0].content.clientWidth / Math.max(output.clientWidth, 1)
      )
    );
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(output.clientWidth * dpr));
    const height = Math.max(1, Math.round(output.clientHeight * dpr));
    if (output.width !== width || output.height !== height) {
      output.width = width;
      output.height = height;
      changed = true;
    }
    return changed;
  }

  syncCanvasSize();

  let backingRgb = [0.03, 0.04, 0.05];
  let backingLum = 0.04;
  let inkRgb = parseColor(config.color) || [0.35, 0.55, 1.0];

  function syncBacking() {
    let resolved = null;
    if (config.background && config.background !== "auto") {
      resolved = parseColor(config.background);
    }
    backingRgb = resolved || [0.03, 0.04, 0.05];
    backingLum =
      0.299 * backingRgb[0] + 0.587 * backingRgb[1] + 0.114 * backingRgb[2];
    inkRgb = parseColor(config.color) || [0.35, 0.55, 1.0];
  }

  syncBacking();

  const glyphData = new Uint32Array(MAX_GLYPHS);

  function resolveGlyphs() {
    const ramp = config.glyphs?.length > 1
      ? config.glyphs
      : (CHARSETS[config.charset] || CHARSETS.ascii);
    const count = Math.min(ramp.length, MAX_GLYPHS);
    glyphData.fill(0);
    for (let i = 0; i < count; i++) glyphData[i] = ramp[i] >>> 0;
    return count;
  }

  function uploadSlot(state) {
    const bitmap = state.fallbackCanvas;
    if (!bitmap || !state.dirty) return;
    if (bitmap.width < 1 || bitmap.height < 1) return;
    state.dirty = false;
    try {
      gl.bindTexture(gl.TEXTURE_2D, state.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        bitmap
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      state.stamp = performance.now();
    } catch (e) {
      console.warn("AsciiSweep texture upload error:", e);
    }
  }

  let currentSlot = 0;
  let fromSlot = 0;
  let toSlot = 1;
  let progress = 0;
  let sweeping = false;
  let sweepStart = 0;
  let sweepClockSet = false;
  let sweepAngle = config.angle;
  let settleFrames = 0;
  let active = 0;
  let fadingOut = false;

  function render(now) {
    for (const state of states) uploadSlot(state);

    const from = states[fromSlot];
    const to = states[toSlot];

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, from.texture);
    gl.uniform1i(uniforms.uFrom, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, to.texture);
    gl.uniform1i(uniforms.uTo, 1);

    gl.uniform2f(uniforms.uResolution, output.width, output.height);
    gl.uniform1f(uniforms.uProgress, progress);

    const radians = (sweepAngle * Math.PI) / 180;
    gl.uniform2f(uniforms.uDir, Math.cos(radians), Math.sin(radians));

    const dpr = output.width / Math.max(output.clientWidth, 1);
    const glyphCss = Math.max(config.scale, 0.5);
    const spacing = Math.round(Math.min(Math.max(config.spacing, 0), 3));
    gl.uniform1f(uniforms.uGlyphPx, glyphCss * dpr);
    gl.uniform1f(uniforms.uSpacing, spacing);
    gl.uniform1f(
      uniforms.uLod,
      Math.max(0, Math.log2((5 + 2 * spacing) * glyphCss * dpr) - 1)
    );

    const glyphCount = resolveGlyphs();
    gl.uniform1uiv(uniforms["uGlyphs[0]"], glyphData);
    gl.uniform1i(uniforms.uGlyphCount, glyphCount);

    gl.uniform1f(uniforms.uBand, Math.min(Math.max(config.band, 0.02), 1));
    gl.uniform1f(uniforms.uSoftness, config.softness);
    gl.uniform1f(uniforms.uTurbulence, Math.max(config.turbulence, 0));
    gl.uniform1f(uniforms.uTrail, Math.max(config.trail, 0));
    gl.uniform3f(uniforms.uInk, inkRgb[0], inkRgb[1], inkRgb[2]);
    gl.uniform1f(uniforms.uTint, config.tint);
    gl.uniform1f(uniforms.uGlow, config.glow);
    gl.uniform1f(uniforms.uAberration, Math.max(config.aberration, 0) * dpr);
    gl.uniform1f(uniforms.uFlicker, config.flicker);
    gl.uniform1f(uniforms.uDensity, config.density);
    gl.uniform1f(uniforms.uDisplace, Math.max(config.displace, 0) * dpr);
    gl.uniform1f(uniforms.uContrast, Math.max(config.contrast, 0));
    gl.uniform1f(uniforms.uBrightness, config.brightness);
    gl.uniform1f(uniforms.uInvert, config.invert);
    gl.uniform1f(uniforms.uThreshold, Math.max(config.threshold, 0.001));
    gl.uniform1f(uniforms.uFade, config.fade);
    gl.uniform1f(
      uniforms.uAdditive,
      config.blend === "add" ? 1 : config.blend === "over" ? 0 : backingLum < 0.5 ? 1 : 0
    );
    gl.uniform3f(uniforms.uBg, backingRgb[0], backingRgb[1], backingRgb[2]);
    gl.uniform1f(uniforms.uBgLum, backingLum);
    gl.uniform1f(uniforms.uTime, now / 1000);
    gl.uniform1f(uniforms.uActive, active);
    gl.uniform1f(uniforms.uMaxX, contentMaxX);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, output.width, output.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  let raf = 0;
  let running = false;
  let lastFrame = performance.now();

  function ease(t) {
    const c = 1 - Math.min(Math.max(t, 0), 1);
    return 1 - c * c * c;
  }

  function frame(now) {
    if (destroyed) return;

    if (sweeping) {
      if (!sweepClockSet) {
        sweepClockSet = true;
        sweepStart = now;
      }
      const duration = Math.max(config.duration, 0.05);
      const linear = Math.min(1, (now - sweepStart) / 1000 / duration);
      progress = ease(linear);

      if (progress >= 0.5 && currentSlot !== toSlot) {
        currentSlot = toSlot;
        applyStacking(currentSlot);
      }

      if (linear >= 1) {
        progress = 1;
        sweeping = false;
        currentSlot = toSlot;
        applyStacking(currentSlot);
        settleFrames = 2;
        config.onSweepEnd?.(currentSlot);
      }
    }

    if (fadingOut) {
      const step = (now - lastFrame) / 1000 / FADE_OUT_S;
      active = Math.max(0, active - Math.max(step, 0));
      if (active <= 0.001) {
        active = 0;
        fadingOut = false;
      }
    }
    lastFrame = now;

    render(now);

    if (!sweeping && !fadingOut) {
      if (settleFrames > 0) {
        settleFrames -= 1;
        if (settleFrames === 0) fadingOut = true;
      } else if (active === 0) {
        running = false;
        return;
      }
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (destroyed || running) return;
    running = true;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }

  wake = start;
  applyStacking(currentSlot);
  requestCapture(true);
  start();

  function sweep(to, sweepOptions) {
    if (destroyed) return;
    const target = to === 1 ? 1 : 0;
    if (sweeping ? target === toSlot : target === currentSlot) return;

    fromSlot = currentSlot;
    toSlot = target;
    progress = 0;
    sweepAngle = sweepOptions?.angle ?? config.angle;
    sweepClockSet = false;

    sweeping = true;
    settleFrames = 0;
    fadingOut = false;
    active = 1;

    applyStacking(fromSlot);
    requestCapture(true);
    config.onSweepStart?.(target);
    start();
  }

  const resizeObserver = new ResizeObserver(() => {
    if (syncCanvasSize()) requestCapture();
    start();
  });
  resizeObserver.observe(output);
  for (const state of states) resizeObserver.observe(state.content);

  return {
    setOptions(next) {
      Object.assign(config, next);
      syncBacking();
      start();
    },
    sweep,
    current: () => currentSlot,
    capture: () => {
      requestCapture(true);
      start();
    },
    resize: () => {
      syncCanvasSize();
      syncBacking();
      requestCapture();
      start();
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      for (const state of states) {
        window.clearTimeout(state.captureTimer);
        gl.deleteTexture(state.texture);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(quad);
    }
  };
}
