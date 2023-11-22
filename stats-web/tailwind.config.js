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
          "accent": "#ff6c9c",
          "base-100": "#111111",
          "base-200": "#222222",
          "base-300": "#333333",
          "neutral": "#ffffff",
          "neutral-content": "#111111",
        }
      }
    ]
  }
}

