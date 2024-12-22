/** @type {import('tailwindcss').Config} */
module.exports = {

  darkMode: 'class', // Enable dark mode via class
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all files in the src directory
    "./components/**/*.{js,jsx,ts,tsx}", // Include all files in the components directory
    "./pages/**/*.{js,jsx,ts,tsx}" // Include all files in the pages directory

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

