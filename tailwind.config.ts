import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        'adawi': {
          beige: '#F5F1E8',
          'beige-dark': '#E8E0D0',
          brown: '#8B4513',
          'brown-light': '#D2B48C',
          gold: '#DAA520',
          'gold-light': '#F4E4A6',
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
