/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background' : "#1c1c1c",
        'text' : "#ffffff",
        'primary' : "#c9a3a5",
        'secondary' : "#644949",
        'accent' : "#74a9b3"
      }
    },
    
  },
  plugins: [require("tailwindcss-animate")],
}

