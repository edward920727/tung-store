/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beige-light': '#faf9f7', // 極淡米色
        'mauve-light': '#f5f3f0', // 莫蘭迪灰米色
        'mauve-gray': '#e8e6e3', // 莫蘭迪灰
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      fontWeight: {
        light: '300',
        extralight: '200',
      },
    },
  },
  plugins: [],
}
