/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-soft': '#dbeafe',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        card: '#ffffff',
        muted: '#64748b',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
