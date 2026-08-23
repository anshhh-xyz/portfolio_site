// ==========================================================================
// Skills Component Controller
// ==========================================================================

(function initSkillsController() {
  const tabs = Array.from(document.querySelectorAll(".skills-tab"));
  const outputCanvas = document.getElementById("skills-sweep-canvas");
  const slot0Content = document.getElementById("skills-panel-0");
  const slot1Content = document.getElementById("skills-panel-1");
  const slot0Source = document.querySelector("#skills-slot-0 .skills-slot-source");
  const slot1Source = document.querySelector("#skills-slot-1 .skills-slot-source");

  if (!tabs.length || !slot0Content || !outputCanvas || !slot0Source || !slot1Source) return;

  function renderCategoryTo(category, panel) {
    const skills = typeof SKILLS_DATA !== "undefined" ? (SKILLS_DATA[category] || []) : [];
    panel.innerHTML = skills
      .map(
        (skill) => `
        <div class="skill-chip"
          style="--skill-color:${skill.color}; --skill-rgb:${hexToRgbTriplet(skill.color)};"
          data-slug="${skill.slug}" data-name="${skill.name}">
          <div class="skill-icon-wrap" aria-hidden="true">${skill.svg}</div>
          <span class="skill-name">${skill.name}</span>
        </div>`
      )
      .join("");
  }

  const initialTab = document.querySelector(".skills-tab.active") || tabs[0];
  let currentTabIndex = tabs.indexOf(initialTab);
  renderCategoryTo(initialTab.dataset.category, slot0Content);

  const sweepInstance = typeof createAsciiSweep === "function" ? createAsciiSweep({
    output: outputCanvas,
    slots: [
      { source: slot0Source, content: slot0Content },
      { source: slot1Source, content: slot1Content },
    ],
  }, {
    angle: 0,
    duration: 0.8,
    band: 0.28,
    softness: 0.45,
    turbulence: 0.5,
    trail: 0.75,
    scale: 2,
    color: "#5b8cff",
    background: "#050608",
    glow: 2,
    aberration: 5,
  }) : null;

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("active")) return;

      const prevIndex = currentTabIndex;
      currentTabIndex = index;

      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const nextCategory = tab.dataset.category;
      const targetSlot = sweepInstance ? (sweepInstance.current() === 0 ? 1 : 0) : 0;
      const targetContent = targetSlot === 0 ? slot0Content : slot1Content;

      renderCategoryTo(nextCategory, targetContent);

      const angle = index >= prevIndex ? 0 : 180;

      requestAnimationFrame(() => {
        if (sweepInstance) {
          sweepInstance.capture();
          sweepInstance.sweep(targetSlot, { angle });
        }
      });
    });
  });
})();
