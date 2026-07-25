/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EEEBE3",
        ink: "#17181A",
        panel: "#FFFFFF",
        line: "#D8D3C7",
        muted: "#6B6B62",
        pen: "#C23B22",
        cobalt: "#1F3FBF",
        mustard: "#D9A02B",
        sage: "#3E5C4A",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["'Public Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
      },
    },
  },
  plugins: [],
};
