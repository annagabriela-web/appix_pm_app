/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Appix corporate palette
        primary: "#6278fb",
        turquoise: "#00e7ba",
        celeste: "#67adee",
        dark: "#021b33",
        // Semantic
        critical: "#EF4444",
        warning: "#F59E0B",
        healthy: "#00e7ba",
        neutral: "#64748B",
        accent: "#ec4899",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
