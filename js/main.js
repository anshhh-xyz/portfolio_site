function initAnimations() {
  if (typeof initAsciify === "function") {
    initAsciify();
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".section:not(#hero)");
    sections.forEach((sec) => {
      const inner = sec.querySelector(".section-inner");
      if (!inner) return;

      gsap.fromTo(
        inner,
        { opacity: 0.35, y: 24, scale: 0.99, transformOrigin: "center bottom" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 86%",
            toggleActions: "play none none none",
          },
        }
      );

      const headers = inner.querySelectorAll(".section-tag, h2, .lede");
      if (headers.length > 0) {
        gsap.fromTo(
          headers,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sec,
              start: "top 84%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    const cards = document.querySelectorAll(
      ".project-card, .about-terminal, .about-edu-card, .experience-card, .bento-card, .skills-card-grid"
    );

    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { y: 20, scale: 0.99, opacity: 0.4, transformOrigin: "center bottom" },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (typeof window.smoothScrollTo === "function") {
            window.smoothScrollTo(target, -25);
          } else {
            target.scrollIntoView({ behavior: "smooth" });
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
