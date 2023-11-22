/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#b8f818",
          "secondary": "#c2e6c2",
          "accent": "#f4b46b",
          //"accent": "#ff6c9c",
          //"accent": "#6a31f9",
          "base-100": "#111111",
          "base-200": "#222222",
          "base-300": "#333333",
          "neutral": "#404040",
          "neutral-content": "#ffffff",
        }
      }
    ]
  }
}

