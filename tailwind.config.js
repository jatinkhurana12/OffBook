/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#080B14",      // void background
        ink: "#EAF2FF",        // primary text / inverse-button fill
        panel: "#0F1524",      // glass card surface
        line: "#1F2A44",       // hairline borders
        muted: "#8996B3",      // secondary text
        pen: "#FF3D81",        // signal accent (was correction red)
        cobalt: "#4F8FFF",     // electric blue accent
        mustard: "#FFB020",    // amber accent
        sage: "#2DE0C1",       // neon teal accent
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(79,143,255,0.25), 0 0 40px -8px rgba(79,143,255,0.45)",
        "glow-pen": "0 0 0 1px rgba(255,61,129,0.3), 0 0 40px -8px rgba(255,61,129,0.55)",
        "glow-sm": "0 0 20px -6px rgba(79,143,255,0.5)",
        panel: "0 8px 40px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(1deg)" },
          "50%": { transform: "translateY(-10px) rotate(0.5deg)" },
        },
      
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, -30px) scale(1.05)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "page-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 3s linear infinite",
        "page-in": "page-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};