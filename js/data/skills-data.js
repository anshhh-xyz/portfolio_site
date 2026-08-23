// ==========================================================================
// Skills Data & SVG Icon Definitions
// ==========================================================================

const SKILLS_DATA = {
  languages: [
    { name: "Python", slug: "python", color: "#3776AB", svg: `<svg viewBox="0 0 24 24"><path fill="#3776AB" d="M11.914 0C5.82 0 6.193 2.656 6.193 2.656l.007 2.752h5.814v.826H3.898S0 5.787 0 11.9c0 6.115 3.4 5.922 3.4 5.922h2.03v-2.857s-.11-3.4 3.344-3.4h5.759v-.84H8.774s-2.846.104-2.846-2.754c0-2.859 2.483-2.754 2.483-2.754h9.094s3.328.09 3.328-5.32c0-5.413-5.263-5.397-5.263-5.397h-3.656zm-1.72 1.638a1.002 1.002 0 1 1 0 2.004 1.002 1.002 0 0 1 0-2.004z"/><path fill="#FFD43B" d="M12.086 24c6.094 0 5.72-2.656 5.72-2.656l-.006-2.752h-5.814v-.826h8.114S24 18.213 24 12.1c0-6.115-3.4-5.922-3.4-5.922h-2.03v2.857s.11 3.4-3.344 3.4H9.467v.84h5.759s2.846-.104 2.846 2.754c0 2.859-2.483 2.754-2.483 2.754H6.495S3.167 23.693 3.167 29.1c0 5.413 5.263 5.397 5.263 5.397h3.656zm1.72-1.638a1.002 1.002 0 1 1 0-2.004 1.002 1.002 0 0 1 0 2.004z"/></svg>` },
    { name: "SQL", slug: "sql", color: "#00758F", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#00758F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>` },
    { name: "C++", slug: "cpp", color: "#00599C", svg: `<svg viewBox="0 0 24 24"><path fill="#00599C" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.6 13.7a4.2 4.2 0 1 1 0-7.4v1.8a2.4 2.4 0 1 0 0 3.8zm3.2-3.1h1.1v-1.1h.9v1.1h1.1v.9h-1.1v1.1h-.9v-1.1h-1.1zm3.8 0h1.1v-1.1h.9v1.1h1.1v.9h-1.1v1.1h-.9v-1.1h-1.1z"/></svg>` },
    { name: "JavaScript", slug: "javascript", color: "#F7DF1E", svg: `<svg viewBox="0 0 24 24"><path fill="#F7DF1E" d="M0 0h24v24H0z"/><path d="M5.8 19.8l1.7-1c.4.7.8 1.3 1.6 1.3.8 0 1.3-.3 1.3-1.5V11h2.1v7.6c0 2.3-1.4 3.4-3.4 3.4-1.8 0-2.9-1-3.3-2.2zm8.5-.3l1.7-1c.5.8 1.1 1.4 2.2 1.4 1 0 1.6-.5 1.6-1.2 0-.8-.7-1.1-1.8-1.6l-.6-.3c-1.8-.8-3-1.7-3-3.7 0-1.8 1.4-3.3 3.6-3.3 1.6 0 2.7.5 3.5 1.9l-1.6 1c-.4-.7-.8-1-1.8-1-.9 0-1.4.5-1.4 1.1 0 .7.5 1 1.5 1.4l.6.3c2.1.9 3.3 1.8 3.3 3.9 0 2.2-1.7 3.5-3.9 3.5-2.2 0-3.5-1.1-4-2.4z"/></svg>` },
    { name: "TypeScript", slug: "typescript", color: "#3178C6", svg: `<svg viewBox="0 0 24 24"><path fill="#3178C6" d="M0 0h24v24H0z"/><path fill="#fff" d="M13.2 12.3h-2.8V21H8.3v-8.7H5.5V10h7.7zm4.2 4.4c.5.3 1.1.5 1.7.5.8 0 1.2-.3 1.2-.7 0-.5-.4-.7-1.3-1.1l-.8-.3c-1.5-.6-2.4-1.4-2.4-2.8 0-1.8 1.4-3 3.6-3 1.3 0 2.3.4 3 1l-1.1 1.6c-.6-.4-1.2-.7-1.9-.7-.7 0-1.1.3-1.1.7 0 .4.4.6 1.2.9l.8.3c1.7.6 2.5 1.5 2.5 2.9 0 1.8-1.4 3.1-3.9 3.1-1.5 0-2.7-.4-3.6-1.2z"/></svg>` },
    { name: "HTML/CSS", slug: "html-css", color: "#E34F26", svg: `<svg viewBox="0 0 24 24"><path fill="#E34F26" d="M3 2l1.8 20.2L12 24l7.2-1.8L21 2H3zm14.8 6.4h-7.6l.2 2.2h7.2l-.6 6.8-4.6 1.3-4.6-1.3-.3-3.4h2.2l.2 1.8 2.5.7 2.5-.7.3-3.2H7.4l-.6-6.8h11.2l-.2 2.4z"/></svg>` }
  ],
  aiml: [
    { name: "Pandas", slug: "pandas", color: "#150458", svg: `<svg viewBox="0 0 24 24"><path fill="#150458" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-2h2zm0-4h-2V7h2z"/><path fill="#FF4500" d="M7 10h2v7H7zm8-3h2v10h-2z"/></svg>` },
    { name: "NumPy", slug: "numpy", color: "#013243", svg: `<svg viewBox="0 0 24 24"><path fill="#4DABCF" d="M12 2L2 7v10l10 5 10-5V7L12 2zm-1 16.5l-6-3v-7l6 3v7zm2 0v-7l6-3v7l-6 3zm0-9l-6-3 6-3 6 3-6 3z"/></svg>` },
    { name: "Matplotlib", slug: "matplotlib", color: "#11557c", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#11557c" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-3 3"/></svg>` },
    { name: "Seaborn", slug: "seaborn", color: "#4c72b0", svg: `<svg viewBox="0 0 24 24"><path fill="#4c72b0" d="M4 19h16v2H4zM4 13h4v4H4zm6-5h4v9h-4zm6-5h4v14h-4z"/></svg>` },
    { name: "Scikit-Learn", slug: "scikit-learn", color: "#F7931E", svg: `<svg viewBox="0 0 24 24"><path fill="#F7931E" d="M12 2L2 7l10 5 10-5-10-5zm0 9L2 16l10 5 10-5-10-5z"/></svg>` },
    { name: "TensorFlow", slug: "tensorflow", color: "#FF6F00", svg: `<svg viewBox="0 0 24 24"><path fill="#FF6F00" d="M12 2L3 7.5v9L12 22l9-5.5v-9L12 2zm-1.2 15.5H8.3V11h2.5v6.5zm4.9 0h-2.5V8.5h2.5v9z"/></svg>` },
    { name: "PyTorch", slug: "pytorch", color: "#EE4C2C", svg: `<svg viewBox="0 0 24 24"><path fill="#EE4C2C" d="M12 2a9.96 9.96 0 0 0-7.07 2.93l1.41 1.41A7.97 7.97 0 0 1 12 4c4.42 0 8 3.58 8 8 0 2.21-.9 4.21-2.35 5.65l1.41 1.41A9.96 9.96 0 0 0 22 12c0-5.52-4.48-10-10-10zm2 4.5l-4 4h3v5h2v-5h3l-4-4z"/></svg>` }
  ],
  tools: [
    { name: "Antigravity", slug: "antigravity", color: "#6366f1", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>` },
    { name: "Git", slug: "git", color: "#F05032", svg: `<svg viewBox="0 0 24 24"><path fill="#F05032" d="M23.546 10.93L13.07.455a1.5 1.5 0 0 0-2.122 0L8.83 2.57l3.084 3.085a1.78 1.78 0 0 1 2.253 2.253l3.02 3.02a1.78 1.78 0 1 1-1.077 1.03l-2.82-2.82v4.316a1.78 1.78 0 1 1-1.52-.06V9.06a1.78 1.78 0 0 1-.96-2.33L7.75 3.65.454 10.94a1.5 1.5 0 0 0 0 2.12l10.477 10.476a1.5 1.5 0 0 0 2.122 0l10.493-10.485a1.5 1.5 0 0 0 0-2.12z"/></svg>` },
    { name: "Google Colab", slug: "colab", color: "#F9AB00", svg: `<svg viewBox="0 0 24 24"><path fill="#F9AB00" d="M16.9 7.5a4.5 4.5 0 0 0-6.36 0L4.18 13.86a4.5 4.5 0 1 0 6.36 6.36L16.9 13.86a4.5 4.5 0 0 0 0-6.36zm-9.54 9.54a2.25 2.25 0 1 1 3.18-3.18 2.25 2.25 0 0 1-3.18 3.18z"/><path fill="#E37400" d="M19.82 4.18a4.5 4.5 0 0 0-6.36 0l-1.06 1.06 3.18 3.18 1.06-1.06a4.5 4.5 0 0 0 3.18-3.18z"/></svg>` },
    { name: "Jupyter", slug: "jupyter", color: "#F37626", svg: `<svg viewBox="0 0 24 24"><path fill="#F37626" d="M12 4.5c-4.14 0-7.5 1.57-7.5 3.5s3.36 3.5 7.5 3.5 7.5-1.57 7.5-3.5-3.36-3.5-7.5-3.5zm0 8c-4.14 0-7.5 1.57-7.5 3.5s3.36 3.5 7.5 3.5 7.5-1.57 7.5-3.5-3.36-3.5-7.5-3.5z"/><circle cx="12" cy="2" r="1.5" fill="#6E6E6E"/><circle cx="19" cy="19" r="1.5" fill="#6E6E6E"/><circle cx="5" cy="19" r="1.5" fill="#6E6E6E"/></svg>` },
    { name: "Supabase", slug: "supabase", color: "#3ECF8E", svg: `<svg viewBox="0 0 24 24"><path fill="#3ECF8E" d="M13.3 2.1a1.2 1.2 0 0 0-2.1.8v8.6H3.8a1.2 1.2 0 0 0-.9 2l9.9 10.5c.8.8 2.1.2 2.1-.8v-8.6h7.4a1.2 1.2 0 0 0 .9-2L13.3 2.1z"/></svg>` }
  ],
  deployment: [
    { name: "Vercel", slug: "vercel", color: "#000000", svg: `<svg viewBox="0 0 24 24"><path fill="#ffffff" d="M12 1L24 22H0L12 1Z"/></svg>` }
  ]
};

function hexToRgbTriplet(hex) {
  if (!hex || hex === "#000000") return "255, 255, 255";
  const num = parseInt(hex.replace("#", ""), 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
