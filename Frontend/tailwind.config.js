/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          base: "#A2BAA5",
          panel: "#0f172a",
          border: "#1e293b",
          cyan: "#06b6d4",
          olive: "#4d7c0f",
          green: "#10b981",
          amber: "#f59e0b",
          red: "#f43f5e",
          glow: "rgba(6, 182, 212, 0.15)"
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Roboto Mono', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Nirmala UI"', '"Noto Sans Devanagari"', '"Noto Sans Gurmukhi"', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 3s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
