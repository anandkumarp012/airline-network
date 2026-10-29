export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aviation: {
          950: '#ffffff',
          900: '#f0f9ff',
          800: '#e0f2fe',
          700: '#bae6fd',
          600: '#7dd3fc',
          500: '#0ea5e9',
          400: '#38bdf8',
          300: '#0284c7',
          200: '#e0f2fe',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(14, 165, 233, 0.10)',
      },
    },
  },
  plugins: [],
};
