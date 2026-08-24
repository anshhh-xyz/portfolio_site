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

  let sweepInstance = null;
  function getSweepInstance() {
    if (!sweepInstance && typeof createAsciiSweep === "function") {
      sweepInstance = createAsciiSweep({
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
        color: "#FFFFFF",
        background: "#080808",
        glow: 2,
        aberration: 5,
      });
    }
    return sweepInstance;
  }

  if ('IntersectionObserver' in window) {
    const skillsSec = document.getElementById('skills');
    if (skillsSec) {
      const skillsObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          getSweepInstance();
          skillsObs.disconnect();
        }
      }, { rootMargin: '300px' });
      skillsObs.observe(skillsSec);
    }
  }

  function switchTab(index) {
    if (index === currentTabIndex || index < 0 || index >= tabs.length) return;

    const tab = tabs[index];
    const prevIndex = currentTabIndex;
    currentTabIndex = index;

    const nextCategory = tab.dataset.category;
    const instance = getSweepInstance();
    const targetSlot = instance ? (instance.current() === 0 ? 1 : 0) : 0;
    const targetContent = targetSlot === 0 ? slot0Content : slot1Content;

    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");
    tab.setAttribute("aria-controls", `skills-panel-${targetSlot}`);
    tab.focus();
    targetContent.setAttribute("aria-labelledby", tab.id || `tab-${nextCategory}`);

    renderCategoryTo(nextCategory, targetContent);

    const angle = index >= prevIndex ? 0 : 180;

    requestAnimationFrame(() => {
      if (instance) {
        instance.capture();
        instance.sweep(targetSlot, { angle });
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => switchTab(index));

    tab.addEventListener("keydown", (e) => {
      let targetIndex = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        targetIndex = (currentTabIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        targetIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        targetIndex = 0;
      } else if (e.key === "End") {
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        switchTab(targetIndex);
      }
    });
  });
})();
