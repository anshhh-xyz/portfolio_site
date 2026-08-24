function initAnimations() {
  if (typeof initAsciify === "function") {
    initAsciify();
  }

  const setupScrollAnimations = () => {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const isMobile = window.innerWidth <= 768;
      const offsetX = isMobile ? 22 : 36;

      // Section Headers: Slide in from Left
      const sections = document.querySelectorAll(".section:not(#hero)");
      sections.forEach((sec) => {
        const headers = sec.querySelectorAll(".section-tag, h2, .lede");
        if (headers.length > 0) {
          gsap.fromTo(
            headers,
            { x: -offsetX, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sec,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      });

      // About Section: Story from Left, Terminal from Right
      const aboutStory = document.querySelector(".about-story");
      const aboutTerminal = document.querySelector("#about .about-terminal");
      if (aboutStory) {
        gsap.fromTo(
          aboutStory,
          { x: -offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: aboutStory,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (aboutTerminal) {
        gsap.fromTo(
          aboutTerminal,
          { x: offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: aboutTerminal,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Tech Stack: Subnav from Left, Grid from Right
      const skillsSubnav = document.querySelector(".skills-subnav");
      const skillsGrid = document.querySelector(".skills-card-grid");
      if (skillsSubnav) {
        gsap.fromTo(
          skillsSubnav,
          { x: -offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: skillsSubnav,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (skillsGrid) {
        gsap.fromTo(
          skillsGrid,
          { x: offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: skillsGrid,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Projects: Alternating Side Entry (Left & Right)
      const projectCards = document.querySelectorAll(".project-card");
      projectCards.forEach((card, index) => {
        const sideDir = index % 2 === 0 ? -offsetX : offsetX;
        gsap.fromTo(
          card,
          { x: sideDir, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      const projectsCta = document.querySelector(".projects-cta-wrap");
      if (projectsCta) {
        gsap.fromTo(
          projectsCta,
          { x: -offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: projectsCta,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Experience: Year Wave from Left, Experience Card from Right
      const yearNav = document.querySelector(".year-nav-container");
      const expWrap = document.querySelector(".experience-single-wrap");
      if (yearNav) {
        gsap.fromTo(
          yearNav,
          { x: -offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: yearNav,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (expWrap) {
        gsap.fromTo(
          expWrap,
          { x: offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: expWrap,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Contact: Terminal from Left, Bento Tiles from Right, Status from Left
      const bentoTerminal = document.querySelector(".bento-terminal");
      const bentoMail = document.querySelector(".bento-mail");
      const bentoGithub = document.querySelector(".bento-github");
      const bentoStatus = document.querySelector(".bento-status");

      if (bentoTerminal) {
        gsap.fromTo(
          bentoTerminal,
          { x: -offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bentoTerminal,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (bentoMail) {
        gsap.fromTo(
          bentoMail,
          { x: offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bentoMail,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (bentoGithub) {
        gsap.fromTo(
          bentoGithub,
          { x: offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bentoGithub,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (bentoStatus) {
        gsap.fromTo(
          bentoStatus,
          { x: -offsetX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bentoStatus,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }
  };

  const scheduleScrollSetup = () => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(setupScrollAnimations, { timeout: 800 });
    } else {
      setTimeout(setupScrollAnimations, 120);
    }
  };

  if (document.readyState === "complete") {
    scheduleScrollSetup();
  } else {
    window.addEventListener("load", scheduleScrollSetup);
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.querySelectorAll('a[href^="#"]:not(.rail a)').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (typeof window.smoothScrollTo === "function") {
            window.smoothScrollTo(target, -25);
          } else {
            target.scrollIntoView({
              behavior: prefersReducedMotion ? "auto" : "smooth",
            });
          }
        }
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAnimations);
} else {
  initAnimations();
}
