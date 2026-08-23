(function initHudCursor() {
  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse), (hover: none)").matches;

  if (isTouchDevice) return;

  const cursorDot = document.getElementById("cursor-dot");
  const cursorFrame = document.getElementById("cursor-frame");
  const cursorTag = document.getElementById("cursor-tag");

  if (!cursorDot || !cursorFrame) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let frameX = mouseX;
  let frameY = mouseY;
  let frameW = 24;
  let frameH = 24;
  let lockedEl = null;
  let isCursorVisible = false;

  function updateCursorPos(clientX, clientY) {
    mouseX = clientX;
    mouseY = clientY;

    if (!isCursorVisible) {
      isCursorVisible = true;
      cursorDot.style.opacity = "1";
      cursorFrame.style.opacity = "1";
    }

    cursorDot.style.setProperty("--x", `${clientX}px`);
    cursorDot.style.setProperty("--y", `${clientY}px`);
  }

  window.addEventListener(
    "mousemove",
    (e) => updateCursorPos(e.clientX, e.clientY),
    { passive: true }
  );
  window.addEventListener(
    "pointermove",
    (e) => updateCursorPos(e.clientX, e.clientY),
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    isCursorVisible = false;
    cursorDot.style.opacity = "0";
    cursorFrame.style.opacity = "0";
  });

  document.addEventListener("mouseenter", (e) => {
    updateCursorPos(e.clientX, e.clientY);
  });

  function renderCursor() {
    if (lockedEl && document.body.contains(lockedEl)) {
      const rect = lockedEl.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      const targetW = rect.width + 12;
      const targetH = rect.height + 8;

      frameX += (targetX - frameX) * 0.32;
      frameY += (targetY - frameY) * 0.32;
      frameW += (targetW - frameW) * 0.32;
      frameH += (targetH - frameH) * 0.32;

      cursorFrame.classList.add("is-locked");
    } else {
      frameX += (mouseX - frameX) * 0.25;
      frameY += (mouseY - frameY) * 0.25;

      let defaultSize = 24;
      if (cursorFrame.classList.contains("is-project")) defaultSize = 54;
      else if (cursorFrame.classList.contains("is-hovering")) defaultSize = 40;

      frameW += (defaultSize - frameW) * 0.28;
      frameH += (defaultSize - frameH) * 0.28;

      cursorFrame.classList.remove("is-locked");
    }

    cursorFrame.style.width = `${Math.round(frameW)}px`;
    cursorFrame.style.height = `${Math.round(frameH)}px`;
    cursorFrame.style.setProperty("--x", `${frameX}px`);
    cursorFrame.style.setProperty("--y", `${frameY}px`);

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  window.addEventListener("pointerdown", () => {
    cursorFrame.classList.add("is-clicking");
    cursorDot.classList.add("is-clicking");
  });

  window.addEventListener("pointerup", () => {
    cursorFrame.classList.remove("is-clicking");
    cursorDot.classList.remove("is-clicking");
  });

  function attachHover(selector, { isProject = false, isSnap = false, label = "" } = {}) {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (isSnap) {
          lockedEl = el;
        } else {
          cursorFrame.classList.add("is-hovering");
          if (isProject) cursorFrame.classList.add("is-project");
        }
        if (cursorTag && label) cursorTag.textContent = label;
      });

      el.addEventListener("mouseleave", () => {
        if (isSnap) {
          if (lockedEl === el) lockedEl = null;
        } else {
          cursorFrame.classList.remove("is-hovering", "is-project");
        }
        if (cursorTag && label) cursorTag.textContent = "";
      });
    });
  }

  attachHover(".rail a", { isSnap: true, label: "" });
  attachHover(".rail-brand", { isSnap: true, label: "" });
  attachHover(".skills-tab", { isSnap: true, label: "" });

  attachHover(".project, .project-card", { isProject: true, label: "inspect" });
  attachHover('.project-icon-link[title*="Source"]', { label: "github" });
  attachHover('.project-icon-link[title*="Demo"]', { label: "demo" });
  attachHover(".year-node", { label: "milestone" });
  attachHover(".exp-preview-link", { label: "preview" });
  attachHover(".experience-card", { isProject: true, label: "experience" });
  attachHover(".bento-terminal", { isProject: true, label: "terminal" });
  attachHover(".bento-mail", { label: "mailbox" });
  attachHover(".bento-github", { label: "github" });
  attachHover(".bento-copy-btn", { label: "copy" });
  attachHover(".terminal-submit-btn", { label: "dispatch" });
  attachHover(".hero-bmo-wrap", { isProject: true, label: "mascot" });
  attachHover("a:not(.rail a):not(.project-icon-link):not(.bento-action-btn):not(.exp-preview-link)", { label: "open" });
  attachHover("h1, h2", { label: "" });
  attachHover("[data-asciify]", { label: "decode" });
  attachHover(".about-terminal", { label: "terminal" });
  attachHover(".about-edu-card", { label: "education" });
  attachHover(".about-achievements-list li", { label: "milestone" });

  const skillsContainer = document.getElementById("skills-sweep-container") || document.getElementById("skills");
  if (skillsContainer) {
    skillsContainer.addEventListener("pointerover", (e) => {
      const chip = e.target.closest(".skill-chip");
      if (!chip) return;
      cursorFrame.classList.add("is-hovering");
      if (cursorTag) cursorTag.textContent = chip.dataset.name ? chip.dataset.name.toLowerCase() : "";
    });
    skillsContainer.addEventListener("pointerout", (e) => {
      const chip = e.target.closest(".skill-chip");
      const toChip = e.relatedTarget && e.relatedTarget.closest(".skill-chip");
      if (chip && !toChip) {
        cursorFrame.classList.remove("is-hovering");
        if (cursorTag) cursorTag.textContent = "";
      }
    });
  }
})();
