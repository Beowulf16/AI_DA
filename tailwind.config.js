/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'kipi-primary': '#B3D943',
        'kipi-secondary': '#4B7DFC',
      },
    },
  },
  plugins: [],
};
