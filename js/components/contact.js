(function initContactBento() {
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  const form = document.getElementById("terminal-contact-form");
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const msgInput = document.getElementById("contact-msg");
  const feedback = document.getElementById("terminal-feedback");
  const submitBtn = document.getElementById("terminal-submit-btn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (nameInput?.value || "").trim();
      const email = (emailInput?.value || "").trim();
      const msg = (msgInput?.value || "").trim();

      if (!name || !email || !msg) return;

      const safeName = escapeHtml(name);

      if (feedback) {
        feedback.className = "terminal-feedback-output info";
        feedback.innerHTML = `<span class="t-caret">&gt;</span> [INFO] Packaging payload (author: <span style="color:#ffffff">${safeName}</span>)...`;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
      }

      setTimeout(() => {
        if (feedback) {
          feedback.className = "terminal-feedback-output success";
          feedback.innerHTML = `<span class="t-caret">&gt;</span> [SUCCESS] Handshake OK (payload size: ${(name.length + email.length + msg.length)}B). Opening mail client...`;
        }

        const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(
          `Hi Ansh,\n\n${msg}\n\n---\nSender: ${name}\nEmail: ${email}`
        );
        const mailtoUrl = `mailto:ansh.ash72@gmail.com?subject=${subject}&body=${body}`;

        window.location.href = mailtoUrl;

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
          }
        }, 1500);
      }, 400);
    });
  }

  const copyBtn = document.getElementById("copy-email-btn");
  const emailTextEl = document.getElementById("email-address-text");

  if (copyBtn && emailTextEl) {
    copyBtn.addEventListener("click", async () => {
      const email = emailTextEl.innerText.trim();
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.classList.add("copied");
        const label = copyBtn.querySelector(".copy-label");
        if (label) label.textContent = "Copied!";

        setTimeout(() => {
          copyBtn.classList.remove("copied");
          if (label) label.textContent = "Copy";
        }, 2200);
      } catch (err) {

        const temp = document.createElement("textarea");
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);

        copyBtn.classList.add("copied");
        const label = copyBtn.querySelector(".copy-label");
        if (label) label.textContent = "Copied!";

        setTimeout(() => {
          copyBtn.classList.remove("copied");
          if (label) label.textContent = "Copy";
        }, 2200);
      }
    });
  }
})();
