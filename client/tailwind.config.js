/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B5B95',
          light: '#8B7BB5',
          dark: '#4B3B75',
          50: '#f5f3fa',
          100: '#ede9f5',
        },
        accent: {
          DEFAULT: '#FF6F61',
          light: '#FF8F84',
          dark: '#E05040',
        },
        success: {
          DEFAULT: '#00A86B',
          light: '#00C880',
          dark: '#007A4D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
