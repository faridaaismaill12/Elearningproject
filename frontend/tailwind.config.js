/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all files in the src directory
    "./components/**/*.{js,jsx,ts,tsx}", // Include all files in the components directory
    "./pages/**/*.{js,jsx,ts,tsx}" // Include all files in the pages directory
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))", // Custom background color
        foreground: "hsl(var(--foreground))", // Custom foreground color
        border: "hsl(var(--border))" // Custom border color
      },
    },
  },
  plugins: [],
};
