/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode via class
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all relevant frontend files
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))', // Default border color
      },
    },
  },
  plugins: [],
};