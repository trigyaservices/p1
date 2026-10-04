/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        shelter: {
          teal: '#0f766e',
          'teal-dark': '#115e59',
          'teal-light': '#f0fdfa',
          orange: '#f97316',
          'orange-dark': '#ea580c',
          'orange-light': '#fff7ed',
          dark: '#0f172a',
          surface: '#ffffff',
          muted: '#64748b',
          border: '#e2e8f0'
        }
      }
    }
  },
  plugins: []
};
